const express = require("express");
const router = express.Router();
const ShortLink = require("../schema/link.schema");
const User = require("../schema/user.schema");
const shortid = require("shortid");
require("dotenv").config();
const device = require("express-device");
router.use(device.capture());

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

    // Increment the link's click count
    link.clicks += 1;

    // Get user details (device info, IP, etc.)
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userDevice = req.headers["user-agent"];
    const deviceType = req.device.type || "Unknown"; // Get device type using express-device

    // Store response details in the ShortLink model
    link.responses.push({
      createdAt: new Date(),
      shortCode: link.shortCode,
      shortUrl: link.shortUrl,
      originalUrl: link.originalUrl,
      remarks: link.remarks,
      clicks: link.clicks,
      ipAddress,
      userDevice,
      device: deviceType,
    });

    // Save the updated link
    await link.save();

    // Update User Clicks Data
    const user = await User.findOne({ _id: link.userId });
    if (user) {
      // Increment total clicks
      user.totalClicks += 1;

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Get the last entry in dailyClicks (if it exists)
      const lastEntry = user.dailyClicks[user.dailyClicks.length - 1];

      if (lastEntry && lastEntry.date === today) {
        // If today's date already exists, just increment it
        lastEntry.count += 1;
      } else {
        // If it's a new day, carry forward the previous day's totalClicks count
        const previousClicks = lastEntry ? lastEntry.count : 0;
        user.dailyClicks.push({ date: today, count: previousClicks + 1 });
      }

      // Update device click count
      const deviceEntry = user.devices.find(
        (entry) => entry.deviceType === deviceType
      );

      if (deviceEntry) {
        deviceEntry.count += 1;
      } else {
        user.devices.push({ deviceType, count: 1 });
      }

      await user.save();
    }

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

// update the link
// 📌 3️⃣ Update a Short Link (edit the details of an existing link without changing shortCode)
router.put("/update/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { originalUrl, expiresIn, expiresAt, remarks } = req.body;

    // Check if at least one parameter is provided to update
    if (!originalUrl && !expiresIn && !expiresAt && !remarks) {
      return res.status(400).json({ message: "No data to update" });
    }

    // Find the existing short link by shortCode
    const link = await ShortLink.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({ message: "Short link not found" });
    }

    // Update fields if provided
    if (originalUrl) {
      link.originalUrl = originalUrl;
    }

    if (expiresIn) {
      link.expiresAt = new Date(Date.now() + expiresIn * 60000); // Calculate expiration from minutes
    } else if (expiresAt) {
      link.expiresAt = new Date(expiresAt); // Use provided expiration date
    }

    if (remarks) {
      link.remarks = remarks;
    }

    // Save the updated link
    await link.save();

    res.status(200).json({
      message: "Short link updated successfully",
      shortUrl: link.shortUrl, // Return the unchanged short URL
      originalUrl: link.originalUrl,
      expiresAt: link.expiresAt || "Lifetime",
      remarks: link.remarks || "No remarks",
    });
  } catch (error) {
    console.error("Error updating short link:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 4️⃣ Delete specific fields of a Short Link (remove details like originalUrl, remarks, expiresAt, expiresIn, shortUrl)
router.delete("/delete/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find and delete the document
    const deletedLink = await ShortLink.findOneAndDelete({ shortCode });

    if (!deletedLink) {
      return res.status(404).json({ message: "Short link not found" });
    }

    res.status(200).json({
      message: "Short link deleted successfully",
      shortCode: shortCode, // Returning shortCode to confirm deletion
    });
  } catch (error) {
    console.error("Error deleting short link:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// search based on the remarks
router.get("/", async (req, res) => {
  try {
    const query = req.query.remarks || ""; // Extract 'remarks' from query params
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    const shortLinks = await ShortLink.find({
      remarks: { $regex: query, $options: "i" }, // Case-insensitive search on remarks
    })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    return res.status(200).json(shortLinks);
  } catch (error) {
    console.error("Error fetching short links:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET API to fetch responses for a specific short link
router.get("/:shortCode/responses", async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the short link by shortCode
    const link = await ShortLink.findOne({ shortCode });

    if (!link) {
      return res.status(404).json({ message: "Short link not found" });
    }

    // Return the responses array
    res.status(200).json({
      message: "Responses fetched successfully",
      responses: link.responses,
    });
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// for click in dashboard
router.get("/analytics/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user details
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare analytics data
    const analyticsData = {
      totalClicks: user.totalClicks,
      dailyClicks: user.dailyClicks, // Array of { date, count }
      devices: user.devices, // Array of { deviceType, count }
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
