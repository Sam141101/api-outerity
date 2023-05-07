const mongoose = require("mongoose");

const SizeSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: { type: String, enum: ["S", "M", "L"], required: true },
    inStock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Size", SizeSchema);
