const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema(
  {
    pick_shift: { type: Array }, // API Lấy danh sách ca lấy
    service_id: { type: Number }, //  API lấy gói dịch vụ

    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    expireAt: { type: Date, default: undefined, index: { expires: "0s" } }, // thêm field expireAt
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipping", shippingSchema);
