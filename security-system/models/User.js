const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },

  failedLogins: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);