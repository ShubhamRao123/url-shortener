const mongoose = require("mongoose");

const shortLinkSchema = new mongoose.Schema({
  userId: {
    type: String, // User ID to identify the user who created the short link
    required: true,
  },
  originalUrl: { type: String, required: true },
  shortCode: { type: String, unique: true, required: true },
  shortUrl: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Expiration time (optional)
  remarks: { type: String },
  clicks: { type: Number, default: 0 }, // New field to track clicks
});

shortLinkSchema.methods.getStatus = function () {
  return this.expiresAt && this.expiresAt < new Date() ? "Expired" : "Active";
};

module.exports = mongoose.model("ShortLink", shortLinkSchema);
