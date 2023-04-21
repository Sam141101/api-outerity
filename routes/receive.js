// const middlewareController = require("../controllers/MiddlewareController");
const middlewareController = require("../controllers/middlewareController");
const receiveController = require("../controllers/receiveController");

const router = require("express").Router();

router.post(
  "/pay",
  middlewareController.verifyToken,
  receiveController.receive
);

module.exports = router;

// router.post("/pay", verifyToken, async (req, res) => {
//   try {
//     let voucher;
//     let totalPriceOrder = req.body.totalPrice;

//     let products = [];
//     req.body.cart.forEach(function (element) {
//       let t1 = {
//         product_id: element.product_id,
//         quantity: element.quantity,
//         price: element.price,
//         size: element.size,
//       };
//       products.push(t1);
//     });

//     await User.updateOne(
//       { _id: req.body.userId },
//       {
//         $set: {
//           fullname: req.body.inputs.fullname,
//           address: req.body.inputs.address,
//           phone: req.body.inputs.phone,
//         },
//       }
//     );

//     const now = new Date();
//     const expiresInMs = 60 * 60 * 24 * 1000; // Thời gian hết hạn của document là 1 ngày
//     const expireAt = new Date(now.getTime() + expiresInMs);

//     if (req.body.codeCoupon) {
//       voucher = await DiscountCode.findOne({
//         coupon_code: req.body.codeCoupon,
//       });
//       if (voucher.discount_type === "percentage") {
//         const discount = voucher.discount_amount / 100;
//         totalPriceOrder = parseFloat(req.body.totalPrice) * (1 - discount); // tính giá tiền đã giảm giá
//         totalPriceOrder = totalPriceOrder.toFixed(2);
//       } else {
//         const discount = voucher.discount_amount;
//         totalPriceOrder = parseFloat(req.body.totalPrice) - discount; // tính giá tiền đã giảm giá
//         totalPriceOrder = totalPriceOrder.toFixed(2);
//       }

//       if (voucher.type_user === "people") {
//         const addUser = await User.findOne({ _id: req.body.userId })
//           .select("_id")
//           .lean();
//         voucher.used_by.push(addUser);
//         await voucher.save();
//       } else {
//         voucher.is_redeemed = true;
//         voucher.is_single_use = true;
//         await voucher.save();
//       }
//     }

//     console.log(totalPriceOrder);
//     const newOrder = new Order({
//       userId: req.body.userId,
//       products: products,
//       method: req.body.inputs.method,
//       amount: totalPriceOrder,
//       expireAt: expireAt, // set giá trị của expireAt
//       status: "pending", // status ban đầu là "pending"
//       cancelAt: null,
//     });

//     const saveOrder = await newOrder.save();
//     const orderId = saveOrder._id;

//     const order = await Order.findOne({ _id: orderId.toString() }).lean();

//     if (!order) {
//       console.log("not found");
//       return;
//     }

//     const CartList = req.body.cart;
//     for (let i = 0; i < CartList.length; i++) {
//       const { cart_id } = CartList[i];
//       const cart = await Cart.findOne({ _id: cart_id });

//       for (let i = 0; i < cart.list_product.length; i++) {
//         const list_pd = await ListProduct.findOne({
//           _id: cart.list_product[i],
//         });

//         list_pd.remove();
//       }

//       await Cart.updateOne(
//         { _id: cart_id },
//         {
//           $set: {
//             list_product: [],
//             total_quantity: 0,
//             total_price: 0,
//           },
//         },
//         { new: true }
//       );
//     }

//     res.status(200).json("success");
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });

// router.post("/pay", verifyToken,
// async (req, res) => {
//   try {
//     console.log(req.body);

//     const products = req.body.cart.map((element) => {
//       return {
//         product_id: element.product_id,
//         quantity: element.quantity,
//         price: element.price,
//         size: element.size,
//       };
//     });

//     await User.updateOne(
//       { _id: req.body.userId },
//       {
//         $set: {
//           fullname: req.body.inputs.fullname,
//           address: req.body.inputs.address,
//           phone: req.body.inputs.phone,
//         },
//       }
//     );

//     let totalPriceOrder = req.body.totalPrice;
//     let voucher;

//     if (req.body.codeCoupon) {
//       voucher = await DiscountCode.findOne({
//         coupon_code: req.body.codeCoupon,
//       });

//       if (voucher) {
//         if (voucher.discount_type === "percentage") {
//           totalPriceOrder *= (100 - voucher.discount_amount) / 100; // tính giá tiền đã giảm giá
//           totalPriceOrder = totalPriceOrder.toFixed(2);
//         } else {
//           totalPriceOrder -= voucher.discount_amount; // tính giá tiền đã giảm giá
//           totalPriceOrder = totalPriceOrder.toFixed(2);
//         }

//         if (voucher.type_user === "people") {
//           voucher.used_by.push(req.body.userId);
//         } else {
//           voucher.is_redeemed = true;
//           // voucher.is_single_use = true;
//         }

//         await voucher.save();
//       }
//     }

//     console.log(totalPriceOrder);
//     const now = new Date();
//     const expiresInMs = 60 * 60 * 24 * 1000; // Thời gian hết hạn của document là 1 ngày
//     const expireAt = new Date(now.getTime() + expiresInMs);

//     const newOrder = new Order({
//       userId: req.body.userId,
//       products,
//       method: req.body.inputs.method,
//       amount: totalPriceOrder,
//       expireAt, // set giá trị của expireAt
//       status: "pending", // status ban đầu là "pending"
//       cancelAt: null,
//     });

//     const saveOrder = await newOrder.save();
//     const orderId = saveOrder._id;

//     const order = await Order.findOne({ _id: orderId.toString() }).lean();

//     if (!order) {
//       console.log("not found");
//       return;
//     }

//     const cartIds = req.body.cart.map((cart) => cart.cart_id);
//     const carts = await Cart.find({ _id: { $in: cartIds } });

//     for (const cart of carts) {
//       await ListProduct.deleteMany({ _id: { $in: cart.list_product } });
//       cart.list_product = [];
//       cart.total_quantity = 0;
//       cart.total_price = 0;
//       await cart.save();
//     }

//     res.status(200).json("success");
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });
