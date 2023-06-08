const paypal = require("paypal-rest-sdk");
const Cart = require("../models/Cart");
const DiscountCode = require("../models/DiscountCode");
const ListProduct = require("../models/ListProduct");
const Order = require("../models/Order");
const mongoose = require("mongoose");

const Product = require("../models/Product");
const User = require("../models/User");
const Address = require("../models/Address");
const Shipping = require("../models/Shipping");

function moneyUSAChange(moneyVND) {
  let mn = parseFloat(moneyVND / 22000);
  console.log("money", mn, typeof mn);
  return Number(mn.toFixed(2));
}

function totalTow(total) {
  return Number(total.toFixed(2));
}

const paypalController = {
  // thanh toán online
  payment: async (req, res) => {
    try {
      if (!req.body.totalPriceDelivery) {
        res.json("Vui lòng điền đầy đủ thông tin!");
      }

      let priceDelivery = moneyUSAChange(req.body.totalPriceDelivery);

      let voucher;
      let totalPriceOrder = req.body.totalPrice;

      let products = [];
      req.body.cart.forEach(function (element) {
        let t1 = {
          product_id: element.product_id,
          quantity: element.quantity,
          price: element.price,
          size: element.size,
          discount: element.product_id.discountProduct_id.discount_amount,
        };
        products.push(t1);
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

      const getAddress = await Address.findOne({
        user_id: mongoose.Types.ObjectId(req.body.userId),
      });

      const now = new Date();
      const expiresInMs = 60 * 1000; // Thời gian hết hạn của document là 60 giây
      const expireAt = new Date(now.getTime() + expiresInMs);

      if (req.body.codeCoupon) {
        voucher = await DiscountCode.findOne({
          coupon_code: req.body.codeCoupon,
        });
        // if (voucher.discount_type === "percentage") {
        //   const discount = voucher.discount_amount / 100;
        //   totalPriceOrder = parseFloat(req.body.totalPrice) * (1 - discount); // tính giá tiền đã giảm giá
        //   totalPriceOrder = totalPriceOrder.toFixed(2);
        // } else {
        //   const discount = voucher.discount_amount;
        //   totalPriceOrder = parseFloat(req.body.totalPrice) - discount; // tính giá tiền đã giảm giá
        //   totalPriceOrder = totalPriceOrder.toFixed(2);
        // }

        if (voucher.type_user === "people") {
          const addUser = await User.findOne({ _id: req.body.userId })
            .select("_id")
            .lean();
          voucher.used_by.push(addUser);
          await voucher.save();
        } else {
          voucher.is_redeemed = true;
          await voucher.save();
        }
      }
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
        order_id: saveOrder._id,
        service_id: req.body.inputs.service_id,
        expireAt: expireAt,
      });

      await newShipping.save();

      // thanh toán Paypal

      const CartList = req.body.cart;
      const cartid = CartList[0].cart_id;
      let items = [];
      let total = 0.0;
      for (let i = 0; i < CartList.length; i++) {
        const { product_id, quantity } = CartList[i];
        const product = await Product.findOne({ _id: product_id }).populate(
          "discountProduct_id"
        );
        console.log("product", product);
        let priceProduct;
        if (product.discountProduct_id.discount_amount !== 0) {
          priceProduct = moneyUSAChange(
            product.price *
              (1 - product.discountProduct_id.discount_amount / 100)
          );
        } else {
          priceProduct = moneyUSAChange(product.price);
        }

        console.log("priceProduct", priceProduct);

        if (req.body.codeCoupon && req.body.codeCoupon === "Mã giảm giá") {
          if (voucher.discount_type === "percentage") {
            const discount = voucher.discount_amount / 100;
            priceProduct = priceProduct * (1 - discount); // tính giá tiền đã giảm giá
            priceProduct = priceProduct.toFixed(2);
          } else {
            const discount = moneyUSAChange(voucher.discount_amount);
            priceProduct = priceProduct - discount; // tính giá tiền đã giảm giá
            priceProduct = priceProduct.toFixed(2);
          }
        }

        const priceItem = Number(priceProduct * quantity);
        console.log("priceItem", priceItem);

        // Gọi các phương thức / function cần thiết để xử lý thông tin sản phẩm
        let tp = {
          name: product.title,
          sku: product._id.toString(),
          price: priceProduct.toString(),
          quantity: quantity.toString(),
          currency: "USD",
          // discount: {
          //   amount: "2.00",
          //   percentage: "20",
          // },
        };
        items.push(tp);
        // console.log("current total", total);
        total = totalTow(total + priceItem);
        console.log(">>>> TOTAL >>>> ", total);
      }

      const create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
          // thêm address
          // address: {
          //   line1: "123 Address St",
          //   city: "City",
          //   state: "State",
          //   postal_code: "12345",
          //   country_code: "US",
          // },
        },
        redirect_urls: {
          // return_url: "http://localhost:3000/dat-hang-thanh-cong",
          return_url: `${process.env.BASE_URL}dat-hang-thanh-cong`,
          // cancel_url: "http://localhost:3000/dat-hang-that-bai",
          cancel_url: `${process.env.BASE_URL}dat-hang-that-bai`,
        },
        transactions: [
          {
            item_list: {
              items: items,
            },

            shipping_address: {
              line1: `${getAddress.address}, ${getAddress.ward}`,
              state: `${getAddress.district}`,
              city: `${getAddress.province}`,
              country_code: "VN",
              postal_code: "700000",
            },

            amount: {
              currency: "USD",
              // total: total.toString(),
              total: `${Number(total) + Number(priceDelivery)}`,
              details: {
                subtotal: total.toString(), // phí vận chuyển
                shipping: priceDelivery.toString(),
              },
            },
            // description: orderId.toString(),
            description: "fff",
          },
        ],
      };

      console.log(
        "create_payment_json",
        create_payment_json.transactions[0].amount
      );

      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          console.log(error);
          res.json("Thanh toán thất bại");

          throw error;
        } else {
          for (let i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel === "approval_url") {
              console.log(payment.links[i].href);
              const link = payment.links[i].href;
              res.json({ link, total, orderId, cartid });
              // res.json({ link });
            }
          }
        }
      });

      // res.status(200).json(create_payment_json);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  //   success
  paymentSuccess: async (req, res) => {
    try {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;

      const amountPrice = req.query.amount;
      const orderId = req.query.orderId;

      const cartId = req.query.cartId;

      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: `${amountPrice}`,
            },
          },
        ],
      };
      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async function (error, payment) {
          if (error) {
            const order = await Order.findOne({
              _id: orderId,
            });
            order.remove();

            res.json("Thanh toán thất bại");
            throw error;
          } else {
            console.log(JSON.stringify(payment));
            await Order.updateOne(
              {
                _id: orderId,
              },
              {
                $set: {
                  status: "accept",
                  expireAt: null,
                  cancelAt: new Date(), // cập nhật giá trị thời gian khi chủ shop chấp nhận đơn hàng
                },
              },
              { new: true }
            );

            await Shipping.updateOne(
              {
                order_id: mongoose.Types.ObjectId(orderId),
              },
              {
                $set: {
                  expireAt: null,
                },
              },
              { new: true }
            );

            // Xóa danh sách sản phẩm trong giỏ hàng
            await ListProduct.deleteMany({ cart_id: cartId });

            // Cập nhật giỏ hàng
            const updatedCart = await Cart.findOneAndUpdate(
              { _id: cartId },
              {
                $set: {
                  list_product: [],
                  total_quantity: 0,
                  total_price: 0,
                },
              },
              { new: true }
            );

            res.status(200).json("Thanh toán thành công");
          }
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  //   cancel
  paymentCancel: async (req, res) => {
    const orderId = req.query.orderId;

    await Shipping.deleteOne({ order_id: orderId });
    await Order.findOneAndRemove({ _id: orderId });

    res.json("Thanh toán thất bại");
  },
};

module.exports = paypalController;
