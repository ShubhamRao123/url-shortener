const express = require("express");
const router = express.Router();
const ShortLink = require("../schema/link.schema");
const shortid = require("shortid");
require("dotenv").config();

// 📌 1️⃣ Create a Short Link

router.post("/create", async (req, res) => {
  try {
    const { userId, originalUrl, expiresIn, expiresAt, remarks } = req.body;

    // Check if originalUrl is provided
    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const shortCode = shortid.generate().slice(0, 8); // Generate a 6-8 character unique hash
    const shortUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/link/${shortCode}`;

    let expirationDate = null;

    if (expiresAt) {
      expirationDate = new Date(expiresAt); // Use provided full date-time
    } else if (expiresIn) {
      expirationDate = new Date(Date.now() + expiresIn * 60000); // Convert minutes to milliseconds
    }

    const newShortLink = await ShortLink.create({
      userId, // Store user ID with the link
      originalUrl,
      shortCode,
      shortUrl,
      expiresAt: expirationDate,
      remarks,
    });

    res.status(201).json({
      message: "Short link created successfully",
      shortUrl,
      expiresAt: expirationDate || "Lifetime",
    });
  } catch (error) {
    console.error("Error creating short link:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 2️⃣ Redirect to Original URL
router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await ShortLink.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({ message: "Short link not found" });
    }

    // Check if link has expired
    if (link.expiresAt && link.expiresAt < new Date()) {
      return res.status(410).json({ message: "This link has expired" });
    }

    // Increment the click count
    link.clicks += 1;
    await link.save();

    // Redirect to the original URL
    res.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error in redirection:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// get data from db
router.get("/short-links/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all short links for the given userId
    const shortLinks = await ShortLink.find({ userId });

    res.status(200).json({ shortLinks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
