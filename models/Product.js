const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    setImg: { type: String, required: true },
    grandeImg: { type: String, required: true },
    categories: { type: String },
    sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Size" }],
    color: { type: Array },
    price: { type: Number, required: true },
    discountProduct_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscountProduct",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
