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

        discount: { type: Number, default: 0 },
        checkEvaluate: { type: Boolean, default: false },
      },
    ],
    amount: { type: Number, required: true },
    method: { type: String },
    descCoupon: { type: String },
    amountCoupon: { type: Number },
    transportFee: { type: Number, default: 0 },
    status: { type: String, default: "pending" },
    expireAt: { type: Date, default: undefined, index: { expires: "0s" } }, // thêm field expireAt
    cancelAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
