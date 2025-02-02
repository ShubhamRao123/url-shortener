const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  totalClicks: {
    type: Number,
    default: 0, // New field to track total clicks made by the user
  },
  dailyClicks: [
    {
      date: { type: String, required: true }, // Storing date as YYYY-MM-DD format
      count: { type: Number, default: 0 }, // Number of clicks on that day
    },
  ],
  devices: [
    {
      deviceType: { type: String, required: true }, // e.g., Mobile, Desktop, Tablet
      count: { type: Number, default: 0 }, // Click count from this device
    },
  ],
});

module.exports = mongoose.model("User", schema);
