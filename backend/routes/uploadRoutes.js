const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * POST /api/upload
 * Handles base64 data URLs or base64 raw strings from folder/file uploads
 */
router.post("/", async (req, res) => {
  try {
    const { data, image, name, filename } = req.body;
    const base64Content = data || image;

    if (!base64Content) {
      return res.status(400).json({ success: false, error: "No image payload provided" });
    }

    let buffer;
    let extension = "png";

    const matches = base64Content.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1].toLowerCase();
      if (mime.includes("jpeg") || mime.includes("jpg")) extension = "jpg";
      else if (mime.includes("webp")) extension = "webp";
      else if (mime.includes("svg")) extension = "svg";
      else if (mime.includes("gif")) extension = "gif";
      else extension = "png";
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Content, "base64");
    }

    const cleanBaseName = (name || filename || "upload")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);
    const uniqueFilename = `${cleanBaseName || "file"}_${Date.now()}.${extension}`;
    const targetFilePath = path.join(UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(targetFilePath, buffer);

    const relativeUrl = `/uploads/${uniqueFilename}`;
    const fullUrl = `${req.protocol}://${req.get("host")}${relativeUrl}`;

    return res.json({
      success: true,
      url: relativeUrl,
      fullUrl,
      filename: uniqueFilename
    });
  } catch (error) {
    console.error("[Upload] Error saving file:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
