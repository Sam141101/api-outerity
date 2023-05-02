const mongoose = require("mongoose");

const DiscountProductSchema = new mongoose.Schema(
  {
    discount_amount: { type: Number, default: 0 },
    expireAt: { type: Date, default: undefined, index: { expires: "0s" } }, // thêm field expireAt
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscountProduct", DiscountProductSchema);
