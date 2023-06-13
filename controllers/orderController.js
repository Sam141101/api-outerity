const DiscountCode = require("../models/DiscountCode");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const axios = require("axios");
const Shipping = require("../models/Shipping");
const Size = require("../models/Size");
const Address = require("../models/Address");

const orderController = {
  // Chi tiết đơn hàng
  getOneOrderUser: async (req, res) => {
    try {
      console.log("fff", req.params);
      const orderList = await Order.findOne({
        _id: mongoose.Types.ObjectId(req.params.orderId),
      }).populate({
        path: "products",
        populate: { path: "product_id" },
      });

      console.log("fafafasf", orderList);
      res.status(200).json({
        orderList: orderList,
        // address: findUserAddress,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
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
          user.canceledOrder = user.canceledOrder + 1;
          await user.save();
          res.status(200).json("Huỷ bỏ đơn hàng thành công...");
        }
      } else if (order && order.status === "pending") {
        order.expireAt = expireTimeAt;
        order.cancelAt = null;
        order.status = "cancel";
        await order.save();
        user.canceledOrder = user.canceledOrder + 1;
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

      let findOrder = await Order.findOne({
        _id: req.body.orderId,
        userId: req.params.id,
        status: "delivery",
      }).populate({
        path: "products",
        populate: { path: "product_id" },
      });

      findOrder.status = "complete";
      findOrder.expireAt = null;
      findOrder.cancelAt = null;
      await findOrder.save();

      findOrder.products.forEach(async (item) => {
        await Size.updateOne(
          { product_id: item.product_id, size: item.size },
          {
            $inc: { inStock: -item.quantity },
          },
          { new: true }
        );
      });

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
      console.log("ffffff", req.params);
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

  // adminAcceptDelete:

  // Admin xác nhận hàng đã được giao
  adminAcceptDelivery: async (req, res) => {
    try {
      console.log("res.body", req.body, req.params, req.body.pick_shift[0].id);

      const findUser = await User.findOne({
        _id: mongoose.Types.ObjectId(req.params.id),
      }).lean();

      console.log("số 1");

      let order = await Order.findOne({
        _id: req.body.orderId,
        userId: req.params.id,
        status: "accept",
      }).populate({
        path: "products",
        populate: { path: "product_id" },
      });

      console.log("số 2");

      order.status = "delivery";
      order.expireAt = null;
      order.cancelAt = null;
      await order.save();

      let cod_amount = 0; // Tiền thu hộ cho người gửi.

      if (order.method === "receive") {
        cod_amount = order.amount;
      }
      console.log("số 3");

      // Danh sách sản phẩm
      let quantiProduct = 0; // tổng số sản phẩm
      let items = [];
      for (let i = 0; i < order.products.length; i++) {
        quantiProduct =
          Number(quantiProduct) + Number(order.products[i].quantity);

        // const product = await Product.findOne({ _id: order.products[i].product_id }).lean();
        let item = {
          name: order.products[i].product_id.title.toString(),
          code: order.products[i].product_id._id.toString(),
          quantity: Number(order.products[i].quantity),
          price: Number(order.products[i].product_id.price),
          length: 80,
          width: 30,
          height: 1 * Number(order.products[i].quantity),
          category: {
            level1: order.products[i].product_id.categories.toString(),
          },
        };
        items.push(item);
      }

      // Tạo đơn đặt hàng trên giao hàng nhanh
      const findReceiver = await Address.findOne({
        user_id: mongoose.Types.ObjectId(req.params.id),
      }).lean();

      const findShopAddress = await Address.findOne({
        user_id: mongoose.Types.ObjectId(process.env.ADMIN_ID),
      }).lean();

      const shopid = Number(process.env.SHOPID);

      const shipping = await Shipping.findOne({
        order_id: mongoose.Types.ObjectId(order._id),
      }).lean();

      // API Tạo đơn trên giao hàng nhanh
      const getPriceServiceGHN = await axios.post(
        // "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee", // sai
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
        {
          payment_type_id: 1, // -
          note: "Nhẹ nhàng, cẩn thận với hàng hoá", // -
          required_note: "CHOTHUHANG", // -
          return_phone: process.env.SDT.toString(), // -
          return_address: findShopAddress.address, // -
          return_district_id: Number(findShopAddress.district_id), // -
          return_ward_code: findShopAddress.ward_id.toString(), // -
          client_order_code: "",
          to_name: findUser.fullname.toString(), // Tên người nhận  -
          to_phone: findUser.phone.toString(), // Số điện thoại người nhận hàng. -
          to_address: `${findReceiver.address}, ${findReceiver.ward}, ${findReceiver.district}, Tỉnh ${findReceiver.province}, Vietnam`, // -
          // to_ward_name: `${findReceiver.ward}`,

          to_ward_code: `${findReceiver.ward_id}`, // -

          // to_district_name: `${findReceiver.district}`,
          to_district_id: Number(findReceiver.district), // -
          to_province_name: `${findReceiver.province}`,
          cod_amount: Number(cod_amount), // -
          content: "Vận chuyển qua giao hàng nhanh", // -
          height: 1 * quantiProduct, // -
          length: 80, // -
          weight: 1500 * quantiProduct, // -
          width: 30, // -

          cod_failed_amount: 2000,
          pick_station_id: 1444, // Mã bưu cục

          deliver_station_id: null,
          insurance_value: Number(order.amount),
          service_id: Number(shipping.service_id), // -
          service_type_id: 0, // -
          coupon: null, // -
          // pick_shift: [req.body.pick_shift.id], // Dùng để truyền ca lấy hàng , Sử dụng API Lấy danh sách ca lấy
          pick_shift: [req.body.pick_shift[0].id], // Dùng để truyền ca lấy hàng , Sử dụng API Lấy danh sách ca lấy --
          items: items,

          pickup_time: 1665272576,
        },
        {
          headers: {
            token: process.env.TOKEN,
            shopid: shopid,
            "Content-type": "application/json",
          },
        }
      );

      console.log("getPriceServiceGHN", getPriceServiceGHN);

      res.status(200).json("Đơn hàng đã được chuyển đi...");
    } catch (err) {
      console.log(err);
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

      console.log("chấp thuận đơn hàng");

      res.status(200).json("Đơn hàng đã được chấp thuận...");
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

  // doanh thu cho tháng hiện tại, tháng trước và cả năm
  monthlyIncome: async (req, res) => {
    const productId = req.query.pid;

    let date = new Date();
    let lastMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    let previousMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);

    try {
      const thisMonthIncome = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(date.getFullYear(), date.getMonth(), 1),
              $lte: new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
              ),
            },
            ...(productId && {
              products: {
                $elemMatch: { product_id: mongoose.Types.ObjectId(productId) },
              },
            }),
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: "$amount" },
          },
        },
        {
          $project: {
            month: "$_id",
            total: 1,
            _id: 0,
          },
        },
        {
          $sort: { month: 1 },
        },
      ]);

      const lastMonthIncome = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(date.getFullYear(), date.getMonth() - 1, 1),
              $lte: new Date(
                date.getFullYear(),
                date.getMonth(),
                0,
                23,
                59,
                59,
                999
              ),
            },
            ...(productId && {
              products: {
                $elemMatch: { product_id: mongoose.Types.ObjectId(productId) },
              },
            }),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const thisYearIncome = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(date.getFullYear(), 0, 1),
              $lte: new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999),
            },
            ...(productId && {
              products: {
                $elemMatch: { product_id: mongoose.Types.ObjectId(productId) },
              },
            }),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const incomeData = {
        this_month: thisMonthIncome,
        last_month: lastMonthIncome[0]?.total ?? 0,
        this_year: thisYearIncome[0]?.total ?? 0,
      };

      res.status(200).json(incomeData);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Get alll
  getAllOrder: async (req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getAllOrderAmountStatus: async (req, res) => {
    try {
      const result = await Order.aggregate([
        { $match: { userId: req.query.userid } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]).exec();
      let number = {
        pending: 0,
        accept: 0,
        delivery: 0,
        complete: 0,
        cancel: 0,
      };
      for (let i = 0; i < result.length; i++) {
        if (result[i] && result[i].status) {
          console.log(result[i].status);
          if (result[i].status === "pending") {
            number.pending = result[i].count;
          } else if (result[i].status === "accept") {
            number.accept = result[i].count;
          } else if (result[i].status === "delivery") {
            number.delivery = result[i].count;
          } else if (result[i].status === "complete") {
            number.complete = result[i].count;
          } else if (result[i].status === "cancel") {
            number.cancel = result[i].count;
          }
        }
      }

      const findUserAddress = await Address.findOne({
        user_id: mongoose.Types.ObjectId(req.query.userid),
      })
        .select(
          "province district ward address province_id district_id ward_id"
        )
        .lean();

      res.status(200).json({
        pending: number.pending,
        accept: number.accept,
        delivery: number.delivery,
        complete: number.complete,
        cancel: number.cancel,
        address: findUserAddress,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  getAdminAllOrderAmountStatus: async (req, res) => {
    try {
      const pending = await Order.countDocuments({
        status: "pending",
      });

      const accept = await Order.countDocuments({
        status: "accept",
      });

      const delivery = await Order.countDocuments({
        status: "delivery",
      });

      const complete = await Order.countDocuments({
        status: "complete",
      });

      const cancel = await Order.countDocuments({
        status: "cancel",
      });

      res.status(200).json({
        pending: pending,
        accept: accept,
        delivery: delivery,
        complete: complete,
        cancel: cancel,
      });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Thống kê đơn hàng

  // thống kê doanh thu cho các tháng hiện tại
  orderStats: async (req, res) => {
    const date = new Date();
    const thisYear = new Date(date.getFullYear(), 0, 1);

    try {
      const data = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thisYear },
            status: "complete",
          },
        },
        {
          $project: {
            month: { $month: "$createdAt" },
            amount: 1,
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$amount" },
          },
        },
        {
          $project: {
            month: "$_id",
            total: 1,
            _id: 0,
          },
        },
        {
          $sort: { month: 1 },
        },
      ]);

      res.status(200).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  monthlyofYear: async (req, res) => {
    const productId = req.query.pid;

    const date = new Date();
    const thisYear = date.getFullYear();

    // Lấy đơn hàng theo năm hiện tại và có trạng thái hoàn thành
    const orders = await Order.find({
      createdAt: { $gte: new Date(`${thisYear}-01-01T00:00:00.000Z`) },
      status: "complete",
      ...(productId && {
        products: {
          $elemMatch: { product_id: mongoose.Types.ObjectId(productId) },
        },
      }),
    });

    const monthly = {};
    orders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      const revenue = order.amount;
      if (!monthly[month]) {
        monthly[month] = {
          total: revenue,
          count: 1,
        };
      } else {
        monthly[month].total += revenue;
        monthly[month].count++;
      }
    });

    const monthlyIncome = Object.keys(monthly).map((month) => ({
      month: parseInt(month) + 1,
      total: monthly[month].total,
      count: monthly[month].count,
    }));

    res.status(200).json(monthlyIncome);
  },
};

module.exports = orderController;
