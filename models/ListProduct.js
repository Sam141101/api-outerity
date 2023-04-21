const mongoose = require("mongoose");

const ListProductSchema = new mongoose.Schema(
  {
    cart_id: { type: String },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1, min: 1 },
    price: { type: Number, default: 0, min: 0 },
    size: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ListProduct", ListProductSchema);
