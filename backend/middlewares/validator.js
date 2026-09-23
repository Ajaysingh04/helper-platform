/**
 * Payload & Coordinate Validator Middleware
 */
const validateBookingCreation = (req, res, next) => {
  const { customerName, customerPhone, serviceName, fullAddress } = req.body;

  if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
    return res.status(400).json({ success: false, message: "Valid customer name (min 2 chars) is required" });
  }

  if (!customerPhone || !/^\+?[0-9]{10,13}$/.test(customerPhone.replace(/[\s-]/g, ""))) {
    return res.status(400).json({ success: false, message: "Valid 10-digit customer phone number is required" });
  }

  if (!serviceName || typeof serviceName !== "string") {
    return res.status(400).json({ success: false, message: "Valid service name is required" });
  }

  if (!fullAddress || typeof fullAddress !== "string" || fullAddress.trim().length < 5) {
    return res.status(400).json({ success: false, message: "Complete service address (min 5 chars) is required" });
  }

  // Validate coordinates if provided
  if (req.body.coordinates) {
    const [lng, lat] = req.body.coordinates;
    if (typeof lng !== "number" || typeof lat !== "number" || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: "Invalid GeoJSON [longitude, latitude] coordinates" });
    }
  }

  next();
};

const validateOtpPayload = (req, res, next) => {
  const { phone, otp } = req.body;

  if (!phone || !/^\+?[0-9]{10,13}$/.test(phone.replace(/[\s-]/g, ""))) {
    return res.status(400).json({ success: false, message: "Valid 10-digit phone number is required" });
  }

  if (otp !== undefined && !/^[0-9]{4,6}$/.test(otp.toString().trim())) {
    return res.status(400).json({ success: false, message: "Valid 4-6 digit numeric OTP is required" });
  }

  next();
};

module.exports = {
  validateBookingCreation,
  validateOtpPayload
};
