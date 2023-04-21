const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String },
    // thêm img và star
    img: { type: Array },
    quantiStar: { type: Number },
    size: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
