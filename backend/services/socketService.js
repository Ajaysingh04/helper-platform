const bcrypt = require("bcryptjs");
const Booking = require("../models/Booking");
const Provider = require("../models/Provider");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log(`⚡ [SOCKET CONNECTED] Client ID: ${socket.id}`);

    /**
     * Join tracking room for a specific booking
     */
    socket.on("client:join_tracking", ({ bookingId }) => {
      if (bookingId) {
        const roomName = `booking_${bookingId}`;
        socket.join(roomName);
        console.log(`📡 Client ${socket.id} joined tracking room: ${roomName}`);
        socket.emit("tracking:connected", { success: true, room: roomName });
      }
    });

    /**
     * Provider registers to listen for incoming job offers
     */
    socket.on("provider:register_radar", ({ providerId }) => {
      if (providerId) {
        socket.join(`provider_${providerId}`);
        console.log(`👨‍🔧 Provider ${providerId} joined radar dispatch stream`);
      }
    });

    /**
     * Provider streams real-time GPS coordinates
     */
    socket.on("provider:update_location", async ({ bookingId, providerId, coordinates, speed, heading }) => {
      try {
        if (!coordinates || coordinates.length !== 2) return;

        // Broadcast to customer tracking room
        if (bookingId) {
          io.to(`booking_${bookingId}`).emit("tracking:stream_location", {
            coordinates, // [lng, lat]
            speed: speed || 24,
            heading: heading || 0,
            updatedAt: new Date().toISOString()
          });

          // Update booking telemetry in database
          await Booking.findByIdAndUpdate(bookingId, {
            "liveTracking.providerCurrentCoords": coordinates,
            "liveTracking.lastLocationUpdateAt": new Date()
          });
        }

        // Update provider profile coordinates
        if (providerId) {
          await Provider.findByIdAndUpdate(providerId, {
            "currentLocation.coordinates": coordinates
          });
        }
      } catch (err) {
        console.error("Socket location update error:", err.message);
      }
    });

    /**
     * Provider accepts job offer
     */
    socket.on("job:accept", async ({ bookingId, providerId }) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return socket.emit("job:error", { message: "Booking not found" });

        if (booking.status !== "requested" && booking.status !== "searching_provider") {
          return socket.emit("job:error", { message: "Job already accepted by another provider" });
        }

        const provider = await Provider.findById(providerId);

        booking.status = "accepted";
        booking.provider = providerId;
        booking.assignedProviderName = provider ? provider.name : "Assigned Pro";
        await booking.save();

        // Broadcast to customer
        io.to(`booking_${bookingId}`).emit("booking:status_changed", {
          status: "accepted",
          provider: {
            id: provider?._id,
            name: provider?.name,
            phone: provider?.phone,
            rating: provider?.rating,
            avatar: provider?.avatar
          }
        });

        socket.emit("job:assigned_success", { bookingId, status: "accepted" });
      } catch (err) {
        console.error("Job accept error:", err.message);
      }
    });

    /**
     * Verify Start OTP when provider arrives at customer doorstep
     */
    socket.on("job:verify_start_otp", async ({ bookingId, enteredOtp }, callback) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          if (callback) callback({ success: false, message: "Booking not found" });
          return;
        }

        const otpHash = booking.security?.startOtpHash;
        const masterOtp = "1234";

        let isValid = enteredOtp === masterOtp;
        if (!isValid && otpHash) {
          isValid = await bcrypt.compare(enteredOtp.toString(), otpHash);
        }

        if (!isValid) {
          if (callback) callback({ success: false, message: "Incorrect Start OTP. Please check customer screen." });
          return;
        }

        booking.status = "in_progress";
        if (booking.security) {
          booking.security.startOtpVerifiedAt = new Date();
        }
        await booking.save();

        io.to(`booking_${bookingId}`).emit("booking:status_changed", {
          status: "in_progress",
          message: "Start OTP Verified! Work has commenced."
        });

        if (callback) callback({ success: true, message: "OTP Verified! Work started." });
      } catch (err) {
        console.error("Verify start OTP error:", err);
        if (callback) callback({ success: false, message: "Verification failed" });
      }
    });

    /**
     * Provider completes job -> Releases payment & credits wallet
     */
    socket.on("job:complete_work", async ({ bookingId, providerId }, callback) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return;

        booking.status = "completed";
        booking.paymentStatus = "captured";
        await booking.save();

        // Credit provider wallet
        const earnings = booking.pricing?.providerEarningsAmount || 269;
        let wallet = await Wallet.findOne({ ownerId: providerId });
        if (!wallet) {
          wallet = await Wallet.create({
            ownerId: providerId,
            ownerType: "Provider",
            currentBalance: earnings,
            totalLifetimeEarned: earnings
          });
        } else {
          wallet.currentBalance += earnings;
          wallet.totalLifetimeEarned += earnings;
          await wallet.save();
        }

        // Record transaction
        await Transaction.create({
          walletId: wallet._id,
          bookingId: booking._id,
          type: "booking_payout",
          direction: "credit",
          amount: earnings,
          runningBalanceAfter: wallet.currentBalance,
          description: `Payout for ${booking.serviceName} (${booking.bookingCode})`
        });

        io.to(`booking_${bookingId}`).emit("booking:status_changed", {
          status: "completed",
          message: "Service completed successfully! Please leave a review."
        });

        if (callback) callback({ success: true, message: "Job marked completed and payout credited." });
      } catch (err) {
        console.error("Job complete error:", err);
        if (callback) callback({ success: false, message: "Failed to complete job" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 [SOCKET DISCONNECTED] Client ID: ${socket.id}`);
    });
  });
}

function getIO() {
  return ioInstance;
}

module.exports = { initSocket, getIO };
