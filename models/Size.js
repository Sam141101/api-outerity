const mongoose = require("mongoose");

const SizeSchema = new mongoose.Schema(
  {
    size: { type: String, enum: ["S", "M", "L"], required: true },
    inStock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Size", SizeSchema);
