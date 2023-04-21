// const middlewareController = require("../controllers/MiddlewareController");
const middlewareController = require("../controllers/middlewareController");
const orderController = require("../controllers/orderController");

const router = require("express").Router();

// Tạo đơn đặt hàng
router.post("/", middlewareController.verifyToken, orderController.createOrder);

// Khách hàng huỷ đơn hàng
router.put(
  "/order-cancel/:id",
  middlewareController.verifyTokenAndAuthorization,
  orderController.userCanceledOrder
);

// Khách hàng xác nhận đã nhận được hàng
router.put(
  "/order-complete/:id",
  middlewareController.verifyTokenAndAuthorization,
  orderController.userSuccesOrder
);

// get wait-for-confirmation / waiting-for-the-goods / delivering / complete / canceled
router.get(
  "/find/wait-for-order/:id/:status",
  middlewareController.verifyTokenAndAuthorization,
  orderController.getStatusOrder
);

// Lấy sản phẩm tương ứng với product_id và order_id ra để đánh giá
router.get(
  "/find-info-product/evaluate/:id/:order_id/:product_id",
  middlewareController.verifyTokenAndAuthorization,
  orderController.getOrderEvaluate
);

// Admin ----------------------------------------------------------------------

// Admin lấy ra 1 cái order thông qua _id của Order
router.get(
  "/find/:id",
  middlewareController.verifyTokenAndAdmin,
  orderController.getOneOrderId
);

// //GET ALL ORDER STATUS
router.get(
  "/list-status-order/:status",
  middlewareController.verifyTokenAndAdmin,
  orderController.getListOrder
);

// Admin xác nhận hàng đã được giao
router.put(
  "/order-delivery/:id",
  middlewareController.verifyTokenAndAdmin,
  orderController.adminAcceptDelivery
);

// Admin xoá đơn đặt hàng
router.delete(
  "/:id",
  middlewareController.verifyToken,
  orderController.adminDeleteOrder
);

// Admin chấp thuận đơn đặt hàng
router.put(
  "/find/order-confirmation/:id",
  middlewareController.verifyTokenAndAdmin,
  orderController.adminAcceptOrder
);

// admin cập nhật đơn đặt hàng
router.put(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  orderController.adminUpdateOrder
);

// GET MONTHLY INCOME
router.get(
  "/income",
  middlewareController.verifyTokenAndAdmin,
  orderController.monthlyIncome
);

// Get all
router.get(
  "/",
  middlewareController.verifyTokenAndAdmin,
  orderController.getAllOrder
);

module.exports = router;

// // Tạo đơn đặt hàng
// router.post("/", verifyToken, async (req, res) => {
//   try {
//     let products = [];
//     req.body.cart.forEach(function (element) {
//       let tp = {
//         product_id: element.product_id,
//         quantity: element.quantity,
//         price: element.price,
//         size: element.size,
//         checkEvaluate: false,
//       };
//       products.push(tp);
//     });

//     const newOrder = new Order({
//       userId: req.body.userId,
//       products: products,
//       method: req.body.inputs.method,
//       amount: req.body.totalPrice,
//     });

//     const updateUser = await User.updateOne(
//       { _id: req.body.userId },
//       {
//         $set: {
//           fullname: req.body.inputs.fullname,
//           address: req.body.inputs.address,
//           phone: req.body.inputs.phone,
//         },
//       }
//     );

//     const savedOrder = await newOrder.save();
//     res.status(200).json(savedOrder);
//     // res.status(200).json("fff");
//   } catch (err) {
//     res.status(500).json(err);
//     console.log(err);
//   }
// });

// // Khách hàng huỷ đơn hàng
// router.put(
//   "/order-cancel/:id",
//   verifyTokenAndAuthorization,
//   async (req, res) => {
//     try {
//       let order = await Order.findOne({
//         _id: req.body.orderId,
//         userId: req.params.id,
//       });

//       let user = await User.findOne({
//         _id: mongoose.Types.ObjectId(req.params.id),
//       });

//       // const expireTimeAt = new Date(Date.now() + 43200000);
//       const expireTimeAt = null;

//       if (order && order.status === "accept") {
//         let currentTime = new Date();
//         let acceptedTime = order.cancelAt;
//         let hoursDifference = Math.abs(currentTime - acceptedTime) / 36e5;

//         if (hoursDifference >= 12) {
//           console.log("Đã vượt quá 12 tiếng");
//           res
//             .status(200)
//             .json(
//               "Không thể huỷ đơn hàng này, Vui lòng liên hệ trực tiếp shop để biết thêm thông tin..."
//             );
//         } else {
//           console.log("Chưa vượt qua 12 tiếng");
//           order.expireAt = expireTimeAt;
//           order.cancelAt = null;
//           order.status = "cancel";
//           await order.save();
//           user.canceledOrder = user.canceledOrder - 1;
//           await user.save();
//           res.status(200).json("Huỷ bỏ đơn hàng thành công...");
//         }
//       } else if (order && order.status === "pending") {
//         order.expireAt = expireTimeAt;
//         order.cancelAt = null;
//         order.status = "cancel";
//         await order.save();
//         user.canceledOrder = user.canceledOrder - 1;
//         await user.save();
//         res.status(200).json("Huỷ bỏ đơn hàng thành công...");
//       }

//       // res.status(200).json("Order has been deleted...");
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   }
// );

// // Khách hàng xác nhận đã nhận được hàng
// router.put(
//   "/order-complete/:id",
//   verifyTokenAndAuthorization,
//   async (req, res) => {
//     try {
//       let findUser = await User.findOne({ _id: req.params.id });
//       if (findUser.firstTimeBuy === 0) {
//         await DiscountCode.updateOne(
//           {
//             _id: req.params.id,
//             descCoupon: "Mã giảm giá 50k khi mua hàng lần đầu tiên",
//           },
//           {
//             $push: { used_by: findUser._id },
//           },
//           { new: true }
//         );
//       }

//       findUser.firstTimeBuy = findUser.firstTimeBuy + 1;
//       await findUser.save();

//       await Order.updateOne(
//         {
//           _id: req.body.orderId,
//           userId: req.params.id,
//           status: "delivery",
//         },
//         {
//           $set: {
//             status: "complete",
//             expireAt: null,
//             cancelAt: null,
//           },
//         },
//         { new: true }
//       );

//       res.status(200).json("Đã nhận được đơn hàng từ shop");
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   }
// );

// // get wait-for-confirmation / waiting-for-the-goods / delivering / complete / canceled
// router.get(
//   "/find/wait-for-order/:id/:status",
//   verifyTokenAndAuthorization,
//   async (req, res) => {
//     try {
//       const orderList = await Order.find({
//         userId: req.params.id,
//         status: `${req.params.status}`,
//       }).populate({
//         path: "products",
//         populate: { path: "product_id" },
//       });
//       res.status(200).json(orderList);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   }
// );

// // Lấy sản phẩm tương ứng với product_id và order_id ra để đánh giá
// router.get(
//   "/find-info-product/evaluate/:id/:order_id/:product_id",
//   verifyTokenAndAuthorization,
//   async (req, res) => {
//     try {
//       const order = await Order.findOne({
//         userId: req.params.id,
//         status: "complete",
//         _id: req.params.order_id,
//         // "products.product_id": req.body.product_id,
//       });

//       if (order) {
//         // Tìm thấy order có sản phẩm có product_id trùng với req.body.product_id
//         const product = order.products.find((p) =>
//           p.product_id.equals(req.params.product_id)
//         );
//         if (product) {
//           // Tìm thấy sản phẩm có product_id trùng với req.body.product_id trong mảng products
//           // Thực hiện các xử lý với sản phẩm này ở đây
//           if (product.checkEvaluate === true) {
//             return;
//           }
//           const infoProduct = await Product.findOne({
//             _id: product.product_id,
//           }).lean();

//           console.log(infoProduct);

//           res.status(200).json({
//             title: infoProduct.title,
//             size: product.size,
//             quantity: product.quantity,
//             categories: infoProduct.categories,
//             price: product.price,
//             img: infoProduct.img,
//           });
//         }
//       }
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   }
// );

// // Admin ----------------------------------------------------------------------

// // Admin lấy ra 1 cái order thông qua _id của Order
// router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const orderList = await Order.findOne({
//       _id: req.params.id,
//     })
//       .populate({
//         path: "products",
//         populate: { path: "product_id" },
//       })
//       .select("_id userId products amount method status");

//     const findUser = await User.findOne({ _id: orderList.userId }).lean();

//     res.status(200).json({
//       orderList: orderList,
//       user: findUser,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });

// // //GET ALL ORDER STATUS
// router.get(
//   "/list-status-order/:status",
//   verifyTokenAndAdmin,
//   async (req, res) => {
//     try {
//       const orderList = await Order.find({
//         status: `${req.params.status}`,
//       })
//         .select("_id amount method status")
//         .lean();

//       res.status(200).json(orderList);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   }
// );

// // Admin xác nhận hàng đã được giao
// router.put("/order-delivery/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     await Order.updateOne(
//       {
//         _id: req.body.orderId,
//         userId: req.params.id,
//         status: "accept",
//       },
//       {
//         $set: {
//           status: "delivery",
//           expireAt: null,
//           cancelAt: null,
//         },
//       },
//       { new: true }
//     );

//     res.status(200).json("Đơn hàng đã được chuyển đi...");
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // Admin xoá đơn đặt hàng
// router.delete("/:id", verifyToken, async (req, res) => {
//   try {
//     await Order.findByIdAndDelete(req.params.id);
//     res.status(200).json("Order has been deleted...");
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // Admin chấp thuận đơn đặt hàng
// router.put(
//   "/find/order-confirmation/:id",
//   verifyTokenAndAdmin,
//   async (req, res) => {
//     try {
//       await Order.updateOne(
//         { _id: req.body.orderId, status: "pending", userId: req.params.id },
//         {
//           $set: {
//             status: "accept",
//             expireAt: null,
//             cancelAt: new Date(), // cập nhật giá trị thời gian khi chủ shop chấp nhận đơn hàng
//           },
//         },
//         { new: true }
//       );

//       res.status(200).json("Đơn hàng đã được thanh toán...");
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   }
// );

// // admin cập nhật đơn đặt hàng
// router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedOrder);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // GET MONTHLY INCOME
// router.get("/income", verifyTokenAndAdmin, async (req, res) => {
//   const productId = req.query.pid;
//   let date = new Date();
//   let lastMonth = new Date(date.setMonth(date.getMonth() - 1));
//   let previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
//   // console.log('date >>> ', date);
//   // console.log('lastMonth >>> ', lastMonth);
//   // console.log('previousMonth >>> ', previousMonth);
//   // console.log('test>>> ', new Date());
//   try {
//     // const income = await Order.aggregate([
//     //   {
//     //     $match: {
//     //       createdAt: { $gte: lastMonth },
//     //     }
//     //   }
//     // ])
//     const income = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: lastMonth },
//           ...(productId && {
//             products: { $elemMatch: { productId } },
//           }),
//         },
//       },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//           sales: "$amount",
//         },
//       },
//       {
//         $group: {
//           _id: "$month",
//           total: { $sum: "$sales" },
//         },
//       },
//       {
//         $sort: { _id: 1 },
//       },
//     ]);
//     // console.log(income)
//     res.status(200).json(income);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // Get all
// router.get("/", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const orders = await Order.find().lean();
//     res.status(200).json(orders);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
