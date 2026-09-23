const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const dbStore = require("../data/dbStore");

const TARGET_EMAIL = process.env.EMAIL_USER || "ajayworkon04@gmail.com";

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const { name, email, phone, mobile, category, subject, message } = body;

    const senderName = (name || "").trim();
    const senderEmail = (email || "").trim();
    const senderPhone = (phone || mobile || "").trim();
    const queryTopic = (category || subject || "General Inquiry").trim();
    const userMsg = (message || "").trim();

    if (!senderName || !senderEmail || !userMsg) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required."
      });
    }

    // 1. Send email via Gmail SMTP (Nodemailer) FIRST
    let emailSent = false;
    let emailNotice = "";
    const emailPass = (process.env.EMAIL_PASS || "ogdq ipqe bzou vchl").replace(/\s+/g, "");

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: TARGET_EMAIL,
          pass: emailPass
        }
      });

      const mailOptions = {
        from: `"Helper Platform" <${TARGET_EMAIL}>`,
        to: TARGET_EMAIL,
        replyTo: senderEmail,
        subject: `⚡ New Helper Contact Inquiry: [${queryTopic}] from ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; color: white;">
              <h2 style="margin: 0; font-size: 20px;">⚡ New Helper Contact Inquiry</h2>
              <p style="margin: 6px 0 0 0; opacity: 0.9;">Inquiry received via Helper Contact Form</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 140px; color: #475569;">Customer Name:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 15px;">${senderName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Email Address:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;"><a href="mailto:${senderEmail}">${senderEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Phone Number:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${senderPhone || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Topic / Category:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #6366f1; font-weight: bold;">${queryTopic}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top; font-weight: bold; color: #475569;">Message:</td>
                  <td style="padding: 12px 0; color: #334155; line-height: 1.6; white-space: pre-wrap;">${userMsg}</td>
                </tr>
              </table>
              <div style="margin-top: 24px; text-align: center;">
                <a href="mailto:${senderEmail}?subject=Re: Helper Inquiry (${queryTopic})" style="background: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Reply Directly to ${senderName}</a>
              </div>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log(`[Contact API] Email successfully delivered to ${TARGET_EMAIL}`);
    } catch (mailErr) {
      console.error("[Contact API] Nodemailer error:", mailErr.message);
      emailNotice = mailErr.message;
    }

    // Return response to client immediately
    res.status(200).json({
      success: true,
      message: `Message processed for ${TARGET_EMAIL}`,
      emailSent,
      emailNotice
    });

    // 2. Safely log contact inquiry in background
    setTimeout(async () => {
      try {
        const Contact = require("../models/Contact");
        const Ticket = require("../models/Ticket");
        const { getStatus } = require("../config/db");

        if (getStatus()) {
          await Contact.create({
            name: senderName,
            email: senderEmail,
            phone: senderPhone || "",
            subject: queryTopic,
            message: userMsg
          });
          await Ticket.create({
            id: `TK-${Math.floor(100 + Math.random() * 900)}`,
            customerName: senderName,
            name: senderName,
            email: senderEmail,
            phone: senderPhone || "Not provided",
            subject: `[${queryTopic}] From ${senderName}`,
            message: userMsg,
            priority: "High",
            status: "Open",
            date: new Date().toISOString().split("T")[0]
          });
        } else {
          dbStore.insert("tickets", {
            id: `TK-${Math.floor(100 + Math.random() * 900)}`,
            customerName: senderName,
            email: senderEmail,
            phone: senderPhone || "Not provided",
            subject: `[${queryTopic}] From ${senderName}`,
            priority: "High",
            status: "Open",
            date: new Date().toISOString().split("T")[0],
            description: userMsg
          });
        }
      } catch (storeErr) {
        console.warn("[Contact API] Storage warning:", storeErr.message);
      }
    }, 500);
  } catch (globalErr) {
    console.error("[Contact API] Unexpected error:", globalErr);
    return res.status(500).json({
      success: false,
      message: "Failed to process inquiry",
      error: globalErr.message
    });
  }
});

module.exports = router;
