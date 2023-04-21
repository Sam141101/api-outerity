// const middlewareController = require("../controllers/MiddlewareController");
const middlewareController = require("../controllers/middlewareController");
const paypalController = require("../controllers/paypalController");

const router = require("express").Router();

router.post("/pay", middlewareController.verifyToken, paypalController.payment);

// //GET
router.get("/success", paypalController.paymentSuccess);

router.get("/cancel", paypalController.paymentCancel);

module.exports = router;

// function moneyUSAChange(moneyVND) {
//   let mn = parseFloat(moneyVND / 22000);
//   // console.log("money", typeof Number(mn.toFixed(2)));
//   return Number(mn.toFixed(2));
// }

// function totalTow(total) {
//   return Number(total.toFixed(2));
// }

// router.post("/pay", verifyToken, async (req, res) => {
//   // router.post("/test", async (req, res) => {
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

//     const now = new Date();
//     const expiresInMs = 60 * 1000; // Thời gian hết hạn của document là 60 giây
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
//         // voucher.is_single_use = true;
//         await voucher.save();
//       }
//     }

//     const newOrder = new Order({
//       userId: req.body.userId,
//       products: products,
//       method: req.body.inputs.method,
//       amount: totalPriceOrder,
//       expireAt: expireAt, // set giá trị của expireAt
//       status: "pending", // status ban đầu là "pending"
//       cancelAt: null,
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

//     const saveOrder = await newOrder.save();
//     const orderId = saveOrder._id;

//     // thanh toán Paypal

//     const CartList = req.body.cart;
//     const cartid = CartList[0].cart_id;
//     let items = [];
//     let total = 0.0;
//     for (let i = 0; i < CartList.length; i++) {
//       const { product_id, quantity } = CartList[i];
//       const product = await Product.findOne({ _id: product_id }).lean();
//       let priceProduct = moneyUSAChange(product.price);

//       if (req.body.codeCoupon) {
//         if (voucher.discount_type === "percentage") {
//           const discount = voucher.discount_amount / 100;
//           priceProduct = priceProduct * (1 - discount); // tính giá tiền đã giảm giá
//           priceProduct = priceProduct.toFixed(2);
//         } else {
//           const discount = moneyUSAChange(voucher.discount_amount);
//           priceProduct = priceProduct - discount; // tính giá tiền đã giảm giá
//           priceProduct = priceProduct.toFixed(2);
//         }
//       }

//       const priceItem = Number(priceProduct * quantity);

//       // Gọi các phương thức / function cần thiết để xử lý thông tin sản phẩm
//       let tp = {
//         name: product.title,
//         sku: product._id.toString(),
//         price: priceProduct.toString(),
//         quantity: quantity.toString(),
//         currency: "USD",
//         // discount: {
//         //   amount: "2.00",
//         //   percentage: "20",
//         // },
//       };
//       items.push(tp);
//       // console.log("current total", total);
//       total = totalTow(total + priceItem);
//       console.log(">>>> TOTAL >>>> ", total);
//     }

//     const create_payment_json = {
//       intent: "sale",
//       payer: {
//         payment_method: "paypal",
//       },
//       redirect_urls: {
//         return_url: "http://localhost:3000/test11",
//         cancel_url: "http://localhost:3000/test12",
//       },
//       transactions: [
//         {
//           item_list: {
//             items: items,
//           },
//           amount: {
//             currency: "USD",
//             total: total.toString(),
//           },
//           description: orderId.toString(),
//           // description: "fff",
//         },
//       ],
//     };

//     paypal.payment.create(create_payment_json, function (error, payment) {
//       if (error) {
//         console.log(error);
//         res.json("Thanh toán thất bại");

//         throw error;
//       } else {
//         for (let i = 0; i < payment.links.length; i++) {
//           if (payment.links[i].rel === "approval_url") {
//             console.log(payment.links[i].href);
//             const link = payment.links[i].href;
//             res.json({ link, total, orderId, cartid });
//             // res.json({ link });
//           }
//         }
//       }
//     });

//     // res.status(200).json(create_payment_json);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });

// // //GET
// router.get("/success", async (req, res) => {
//   // router.get("/test11", (req, res) => {
//   try {
//     const payerId = req.query.PayerID;
//     const paymentId = req.query.paymentId;

//     const amountPrice = req.query.amount;
//     const orderId = req.query.orderId;

//     const cartId = req.query.cartId;

//     const execute_payment_json = {
//       payer_id: payerId,
//       transactions: [
//         {
//           amount: {
//             currency: "USD",
//             total: `${amountPrice}`,
//           },
//         },
//       ],
//     };
//     paypal.payment.execute(
//       paymentId,
//       execute_payment_json,
//       async function (error, payment) {
//         if (error) {
//           const order = await Order.findOne({
//             _id: orderId,
//           });
//           order.remove();

//           res.json("Thanh toán thất bại");
//           throw error;
//         } else {
//           console.log(JSON.stringify(payment));
//           await Order.updateOne(
//             {
//               _id: orderId,
//             },
//             {
//               $set: {
//                 status: "accept",
//                 expireAt: null,
//                 cancelAt: new Date(), // cập nhật giá trị thời gian khi chủ shop chấp nhận đơn hàng
//               },
//             },
//             { new: true }
//           );

//           // lấy cart ra
//           const cart = await Cart.findOne({ _id: cartId });
//           for (let i = 0; i < cart.list_product.length; i++) {
//             const list_pd = await ListProduct.findOne({
//               _id: cart.list_product[i],
//             });

//             list_pd.remove();
//           }
//           await Cart.updateOne(
//             { _id: cartId },
//             {
//               $set: {
//                 list_product: [],
//                 total_quantity: 0,
//                 total_price: 0,
//               },
//             },
//             { new: true }
//           );

//           res.status(200).json("Thanh toán thành công");
//         }
//       }
//     );
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });

// router.get("/cancel", async (req, res) => {
//   const orderId = req.query.orderId;
//   const order = await Order.findOne({
//     _id: orderId,
//   });
//   order.remove();

//   res.json("Thanh toán thất bại");
//   // res.send("Cancelled (Đơn hàng đã hủy)");
// });
