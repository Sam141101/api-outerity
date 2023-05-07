const mongoose = require("mongoose");

const DiscountProductSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    discount_amount: { type: Number, default: 0 },
    expireAt: { type: Date, default: undefined, index: { expires: "0s" } }, // thêm field expireAt
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscountProduct", DiscountProductSchema);
