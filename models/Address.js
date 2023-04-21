const mongoose = require("mongoose");
const Cart = require("../models/Cart");

const AddressSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    province: { type: String }, // Tỉnh
    district: { type: String }, // Quận
    ward: { type: String }, // Phường
    address: { type: String },

    province_id: { type: Number }, // mã id Tỉnh
    district_id: { type: Number }, // mã id Quận
    ward_id: { type: Number }, // mã id Phường
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);
