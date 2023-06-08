const Cart = require("../models/Cart");
const DiscountCode = require("../models/DiscountCode");
const ListProduct = require("../models/ListProduct");
const Order = require("../models/Order");

const User = require("../models/User");
const Shipping = require("../models/Shipping");

const receiveController = {
  // thanh toán khi nhận hàng
  receive: async (req, res) => {
    try {
      // console.log("req.body", req.body);
      if (!req.body.totalPriceDelivery) {
        res.status(200).json("Vui lòng điền đầy đủ thông tin!");
      }

      const products = req.body.cart.map((element) => {
        return {
          product_id: element.product_id._id,
          quantity: element.quantity,
          price: element.price,
          size: element.size,
          discount: element.product_id.discountProduct_id.discount_amount,
        };
      });

      let phoneNumber = req.body.inputs.phone.toString();
      const phoneRegex = /^(0|84)\d{9,10}$/;
      if (phoneRegex.test(phoneNumber)) {
        console.log("Số điện thoại hợp lệ");
        if (phoneNumber.startsWith("0")) {
          phoneNumber = "84" + phoneNumber.substring(1);
        }
      } else {
        console.log("Số điện thoại không hợp lệ");
        return res.status(400).json("Số điện thoại không hợp lệ!");
      }

      await User.updateOne(
        { _id: req.body.userId },
        {
          $set: {
            fullname: req.body.inputs.fullname,
            phone: phoneNumber,
          },
        }
      );

      let totalPriceOrder = req.body.totalPrice;
      let voucher;

      if (req.body.codeCoupon) {
        voucher = await DiscountCode.findOne({
          coupon_code: req.body.codeCoupon,
        });

        if (voucher) {
          if (voucher.type_user === "people") {
            voucher.used_by.push(req.body.userId);
          } else {
            voucher.is_redeemed = true;
          }

          await voucher.save();
        }
      }

      // console.log(totalPriceOrder);
      const now = new Date();
      const expiresInMs = 60 * 60 * 24 * 1000; // Thời gian hết hạn của document là 1 ngày
      const expireAt = new Date(now.getTime() + expiresInMs);

      const newOrder = new Order({
        userId: req.body.userId,
        products: products,
        method: req.body.inputs.method,
        amount: totalPriceOrder,
        expireAt: expireAt, // set giá trị của expireAt
        status: "pending", // status ban đầu là "pending"
        cancelAt: null,
        transportFee: req.body.totalPriceDelivery,
      });

      if (voucher) {
        // kiểm tra xem có voucher hay không
        newOrder.descCoupon = voucher.descCoupon;
        newOrder.amountCoupon = voucher.amountCoupon;
      }

      const saveOrder = await newOrder.save();
      const orderId = saveOrder._id;

      const newShipping = new Shipping({
        order_id: orderId,
        service_id: req.body.inputs.service_id,
        expireAt: expireAt,
      });

      await newShipping.save();

      const cartIds = req.body.cart.map((cart) => cart.cart_id);

      const cart_id = cartIds[0];

      await ListProduct.deleteMany({ cart_id: cart_id });

      const updatedCart = await Cart.findOneAndUpdate(
        { _id: cart_id },
        {
          $set: {
            list_product: [],
            total_quantity: 0,
            total_price: 0,
          },
        },
        { new: true }
      );

      res.status(200).json("success");
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
};

module.exports = receiveController;
