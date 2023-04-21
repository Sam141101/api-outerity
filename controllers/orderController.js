const DiscountCode = require("../models/DiscountCode");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const axios = require("axios");
const Shipping = require("../models/Shipping");

const orderController = {
  // Tạo đơn đặt hàng
  createOrder: async (req, res) => {
    try {
      let products = [];
      req.body.cart.forEach(function (element) {
        let tp = {
          product_id: element.product_id,
          quantity: element.quantity,
          price: element.price,
          size: element.size,
          checkEvaluate: false,
        };
        products.push(tp);
      });

      const newOrder = new Order({
        userId: req.body.userId,
        products: products,
        method: req.body.inputs.method,
        amount: req.body.totalPrice,
      });

      const updateUser = await User.updateOne(
        { _id: req.body.userId },
        {
          $set: {
            fullname: req.body.inputs.fullname,
            address: req.body.inputs.address,
            phone: req.body.inputs.phone,
          },
        }
      );

      const savedOrder = await newOrder.save();
      res.status(200).json(savedOrder);
      // res.status(200).json("fff");
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  //  Khách hàng huỷ đơn hàng
  userCanceledOrder: async (req, res) => {
    try {
      let order = await Order.findOne({
        _id: req.body.orderId,
        userId: req.params.id,
      });

      let user = await User.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
      });

      // const expireTimeAt = new Date(Date.now() + 43200000);
      const expireTimeAt = null;

      if (order && order.status === "accept") {
        let currentTime = new Date();
        let acceptedTime = order.cancelAt;
        let hoursDifference = Math.abs(currentTime - acceptedTime) / 36e5;

        if (hoursDifference >= 12) {
          console.log("Đã vượt quá 12 tiếng");
          res
            .status(200)
            .json(
              "Không thể huỷ đơn hàng này, Vui lòng liên hệ trực tiếp shop để biết thêm thông tin..."
            );
        } else {
          console.log("Chưa vượt qua 12 tiếng");
          order.expireAt = expireTimeAt;
          order.cancelAt = null;
          order.status = "cancel";
          await order.save();
          user.canceledOrder = user.canceledOrder - 1;
          await user.save();
          res.status(200).json("Huỷ bỏ đơn hàng thành công...");
        }
      } else if (order && order.status === "pending") {
        order.expireAt = expireTimeAt;
        order.cancelAt = null;
        order.status = "cancel";
        await order.save();
        user.canceledOrder = user.canceledOrder - 1;
        await user.save();
        res.status(200).json("Huỷ bỏ đơn hàng thành công...");
      }

      // res.status(200).json("Order has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Khách hàng xác nhận đã nhận được hàng
  userSuccesOrder: async (req, res) => {
    try {
      let findUser = await User.findOne({ _id: req.params.id });
      if (findUser.firstTimeBuy === 0) {
        await DiscountCode.updateOne(
          {
            _id: req.params.id,
            descCoupon: "Mã giảm giá 50k khi mua hàng lần đầu tiên",
          },
          {
            $push: { used_by: findUser._id },
          },
          { new: true }
        );
      }

      findUser.firstTimeBuy = findUser.firstTimeBuy + 1;
      await findUser.save();

      await Order.updateOne(
        {
          _id: req.body.orderId,
          userId: req.params.id,
          status: "delivery",
        },
        {
          $set: {
            status: "complete",
            expireAt: null,
            cancelAt: null,
          },
        },
        { new: true }
      );

      res.status(200).json("Đã nhận được đơn hàng từ shop");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy ra wait-for-confirmation
  // waiting-for-the-goods
  // delivering
  // complete
  // canceled
  getStatusOrder: async (req, res) => {
    try {
      const orderList = await Order.find({
        userId: req.params.id,
        status: `${req.params.status}`,
      }).populate({
        path: "products",
        populate: { path: "product_id" },
      });
      res.status(200).json(orderList);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy sản phẩm tương ứng với product_id và order_id
  //    Để đánh giá
  getOrderEvaluate: async (req, res) => {
    try {
      const order = await Order.findOne({
        userId: req.params.id,
        status: "complete",
        _id: req.params.order_id,
        // "products.product_id": req.body.product_id,
      });

      if (order) {
        // Tìm thấy order có sản phẩm có product_id trùng với req.body.product_id
        const product = order.products.find((p) =>
          p.product_id.equals(req.params.product_id)
        );
        if (product) {
          // Tìm thấy sản phẩm có product_id trùng với req.body.product_id trong mảng products
          // Thực hiện các xử lý với sản phẩm này ở đây
          if (product.checkEvaluate === true) {
            return;
          }
          const infoProduct = await Product.findOne({
            _id: product.product_id,
          }).lean();

          console.log(infoProduct);

          res.status(200).json({
            title: infoProduct.title,
            size: product.size,
            quantity: product.quantity,
            categories: infoProduct.categories,
            price: product.price,
            img: infoProduct.img,
          });
        }
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Admin ---------------------------------------------------------------------

  // Admin lấy ra 1 cái order thông qua _id của Order
  getOneOrderId: async (req, res) => {
    try {
      const orderList = await Order.findOne({
        _id: req.params.id,
      })
        .populate({
          path: "products",
          populate: { path: "product_id" },
        })
        .select("_id userId products amount method status");

      const findUser = await User.findOne({ _id: orderList.userId }).lean();

      res.status(200).json({
        orderList: orderList,
        user: findUser,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  //GET ALL ORDER STATUS
  getListOrder: async (req, res) => {
    try {
      const orderList = await Order.find({
        status: `${req.params.status}`,
      })
        .select("_id amount method status")
        .lean();

      res.status(200).json(orderList);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Admin xác nhận hàng đã được giao
  adminAcceptDelivery: async (req, res) => {
    try {
      const findUser = await User.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
      }).lean();

      let order = await Order.findOne({
        _id: req.body.orderId,
        userId: req.params.id,
        status: "accept",
      }).populate({
        path: "products",
        populate: { path: "product_id" },
      });

      order.status = "delivery";
      order.expireAt = null;
      order.cancelAt = null;
      await order.save();

      // await Order.updateOne(
      //   {
      //     _id: req.body.orderId,
      //     userId: req.params.id,
      //     status: "accept",
      //   },
      //   {
      //     $set: {
      //       status: "delivery",
      //       expireAt: null,
      //       cancelAt: null,
      //     },
      //   },
      //   { new: true }
      // );

      let cod_amount = 0; // Tiền thu hộ cho người gửi.

      if (order.method === "receive") {
        cod_amount = order.amount;
      }

      // Danh sách sản phẩm
      let quantiProduct = 0; // tổng số sản phẩm
      let items = [];
      for (let i = 0; i < order.products.length; i++) {
        quantiProduct =
          Number(quantiProduct) + Number(order.products[i].quantity);

        // const product = await Product.findOne({ _id: order.products[i].product_id }).lean();
        let item = {
          name: order.products[i].product_id.title,
          code: order.products[i].product_id._id,
          quantity: order.products[i].quantity,
          price: order.products[i].product_id.price,
          length: 80,
          width: 30,
          height: 1 * Number(order.products[i].quantity),
          category: {
            level1: order.products[i].product_id.categories,
          },
        };
        items.push(item);
      }

      // Tạo đơn đặt hàng trên giao hàng nhanh
      const findReceiver = await Address.findOne({
        user_id: mongoose.Types.ObjectId(req.params.id),
      });

      const findShopAddress = await Address.findOne({
        user_id: mongoose.Types.ObjectId(process.env.ADMIN_ID),
      })
        // .select("district_id ward_id address")
        .lean();

      const shopid = Number(process.env.SHOPID);

      const shipping = await Shipping({
        order_id: mongoose.Types.ObjectId(order._id),
      }).lean();

      // API Tạo đơn trên giao hàng nhanh
      const getPriceServiceGHN = await axios.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          payment_type_id: 2,
          note: "Nhẹ nhàng, cẩn thận với hàng hoá",
          required_note: "CHOTHUHANG",
          return_phone: process.env.SDT,
          return_address: findShopAddress.address,
          return_district_id: findShopAddress.district_id,
          return_ward_code: findShopAddress.ward_id,
          client_order_code: "",
          to_name: findUser.fullname, // Tên người nhận
          to_phone: findUser.phone, // Số điện thoại người nhận hàng.
          to_address: `${findReceiver.address}, ${findReceiver.ward}, ${findReceiver.district}, Tỉnh ${findReceiver.province}, Vietnam`,
          to_ward_name: `${findReceiver.ward}`,
          to_district_name: `${findReceiver.district}`,
          to_province_name: `${findReceiver.province}`,
          cod_amount: cod_amount,
          content: "Vận chuyển qua giao hàng nhanh",
          height: 1 * quantiProduct,
          length: 80,
          weight: 1500 * quantiProduct,
          width: 30,

          cod_failed_amount: 2000,
          pick_station_id: findReceiver.findReceiver, // Mã bưu cục

          deliver_station_id: null,
          insurance_value: order.amount,
          service_id: shipping.service_id,
          service_type_id: 0,
          coupon: null,
          pick_shift: [req.body.pick_shift.id], // Dùng để truyền ca lấy hàng , Sử dụng API Lấy danh sách ca lấy
          items: items,
        },
        {
          headers: {
            token: process.env.TOKEN,
            shopid: shopid,
            "Content-type": "application/json",
          },
        }
      );

      res.status(200).json("Đơn hàng đã được chuyển đi...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Admin xoá đơn đặt hàng
  adminDeleteOrder: async (req, res) => {
    try {
      await Order.findByIdAndDelete(req.params.id);
      res.status(200).json("Order has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Admin chấp thuận đơn đặt hàng
  adminAcceptOrder: async (req, res) => {
    try {
      await Order.updateOne(
        { _id: req.body.orderId, status: "pending", userId: req.params.id },
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
          order_id: mongoose.Types.ObjectId(req.body.orderId),
        },
        {
          $set: {
            expireAt: null,
          },
        },
        { new: true }
      );

      res.status(200).json("Đơn hàng đã được thanh toán...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // admin cập nhật đơn đặt hàng
  adminUpdateOrder: async (req, res) => {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedOrder);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // GET MONTHLY INCOME
  monthlyIncome: async (req, res) => {
    const productId = req.query.pid;
    let date = new Date();
    let lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    let previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
    // console.log('date >>> ', date);
    // console.log('lastMonth >>> ', lastMonth);
    // console.log('previousMonth >>> ', previousMonth);
    // console.log('test>>> ', new Date());
    try {
      // const income = await Order.aggregate([
      //   {
      //     $match: {
      //       createdAt: { $gte: lastMonth },
      //     }
      //   }
      // ])
      const income = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: lastMonth },
            ...(productId && {
              products: { $elemMatch: { productId } },
            }),
          },
        },
        {
          $project: {
            month: { $month: "$createdAt" },
            sales: "$amount",
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$sales" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
      // console.log(income)
      res.status(200).json(income);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Get alll
  getAllOrder: async (req, res) => {
    try {
      // const updatedOrder = await Order.findByIdAndUpdate(
      //   req.params.id,
      //   {
      //     $set: req.body,
      //   },
      //   { new: true }
      // );
      // res.status(200).json(updatedOrder);

      const orders = await Order.find().lean();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = orderController;
