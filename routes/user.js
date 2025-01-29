const express = require("express");
const router = express.Router();
const User = require("../schema/user.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword, name, phone } = req.body;

    // Validate that all fields are provided
    if (!email || !password || !confirmPassword || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ message: "Email has already been taken" });
    }

    // Hash the password and create a new user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = await new User({
      email,
      password: hashedPassword,
      name,
      phone,
    }).save();

    // Generate a JWT token
    const token = jwt.sign({ email }, JWT_SECRET);
    res
      .status(200)
      .json({ message: "User created successfully", token, id: newUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }); // Find the user by email

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email }, JWT_SECRET); // Generate a JWT token

    // Return user details along with the token, name, and phone number
    return res.status(200).json({
      message: "Login successfully",
      token,
      id: user._id,
      name: user.name,
      email: user.email, // Include name in the response
      phone: user.phone, // Include phone in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const token = req.headers.authorization.split(" ")[1]; // Extract the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the JWT token

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = decoded.email; // Assuming the token contains the email

    // Find user and update
    const user = await User.findOne({ email: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    await user.save(); // Save the updated user

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET); // Verify JWT
    const userEmail = decoded.email; // Extract email from token

    // Find and delete the user
    const deletedUser = await User.findOneAndDelete({ email: userEmail });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT
    const userEmail = decoded.email; // Extract email from token

    // Fetch user from database
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
