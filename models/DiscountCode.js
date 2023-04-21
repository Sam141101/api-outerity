const mongoose = require("mongoose");

const DisCountCodeSchema = new mongoose.Schema(
  {
    coupon_code: {
      type: String,
      required: true,
      unique: true,
    },

    descCoupon: { type: String, required: true },

    discount_type: {
      type: String,
      enum: ["percentage", "amount"],
      required: true,
    },
    discount_amount: {
      type: Number,
      required: true,
    },
    expiration_date: {
      type: Date,
      default: undefined,
      index: { expires: "0s" },
    }, // thêm field expireAt

    minimum_purchase_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    maximum_uses: {
      type: Number,
      required: true,
      min: 0,
    },
    used_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    type_user: {
      type: String,
      enum: ["people", "person"],
      // required: true,
    },
    valid_for_categories: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // is_single_use: {
    //   type: Boolean,
    //   required: true,
    // },
    is_single_use: {
      type: String,
      enum: ["single_use", "multi_use"],
      required: true,
    },

    is_redeemed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DisCountCode", DisCountCodeSchema);

// "coupon_code" là mã sử dụng coupon.
// "discount_type" có giá trị là "amount", cho biết giảm giá được tính theo số tiền cố định.
// "discount_amount" là giá trị của số tiền giảm giá sẽ được áp dụng.
// "expiration_date" là ngày hết hạn của coupon.
// "minimum_purchase_amount" chỉ ra giá trị đơn hàng tối thiểu để sử dụng coupon.
// "maximum_uses" là số lượng tối đa coupon có thể được sử dụng.
// "used_by" là danh sách các email người dùng đã sử dụng coupon.
// "valid_for_categories" là danh sách các danh mục sản phẩm áp dụng coupon
// "is_single_use" cho biết coupon có thể được sử dụng một lần hay nhiều lần.
// "is_redeemed" cho biết coupon đã được áp dụng hay chưa.
// "created_at" là ngày coupon được tạo.
