const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    setImg: { type: String, required: true },
    grandeImg: { type: String, required: true },
    categories: { type: String },
    // size: { type: Array },
    sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Size" }],
    color: { type: Array },
    price: { type: Number, required: true },
    discountProduct_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscountProduct",
    },
    // inStock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
