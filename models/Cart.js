const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    list_product: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ListProduct" },
    ],
    total_quantity: { type: Number, default: 0, min: 0 },
    total_price: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
