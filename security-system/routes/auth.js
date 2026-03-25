const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: "User not found" });

  if (user.isBlocked)
    return res.status(403).json({ error: "Account blocked" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    user.failedLogins += 1;

    // 🚨 basic detection logic
    if (user.failedLogins >= 5) {
      user.isBlocked = true;
    }

    await user.save();

    return res.status(400).json({ error: "Invalid credentials" });
  }

  // reset failed attempts
  user.failedLogins = 0;
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ token });
});

module.exports = router;