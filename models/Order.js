const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        size: {
          type: String,
          required: true,
        },

        checkEvaluate: { type: Boolean, default: false },
      },
    ],
    amount: { type: Number, required: true },
    method: { type: String },
    coupon: { type: String },
    status: { type: String, default: "pending" },
    expireAt: { type: Date, default: undefined, index: { expires: "0s" } }, // thêm field expireAt
    cancelAt: { type: Date },
    // shippingCost: { type: mongoose.Schema.Types.ObjectId, ref: "ShippingCost" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
