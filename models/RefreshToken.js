const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  refreshToken: { type: String, default: null },
});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
