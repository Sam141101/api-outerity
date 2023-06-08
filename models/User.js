const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    username: { type: String, unique: true },
    fullname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    img: { type: String },
    phone: { type: Number },
    gender: { type: String },
    verified: { type: Boolean, default: false },
    firstTimeBuy: {
      type: Number,
      required: true,
      default: 0,
    },
    canceledOrder: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
