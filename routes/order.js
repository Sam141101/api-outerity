const middlewareController = require("../controllers/middlewareController");
const orderController = require("../controllers/orderController");
const router = require("express").Router();

// Khách hàng huỷ đơn hàng
router.put(
  "/order-cancel/:id",
  middlewareController.verifyTokenAndAuthorization,
  orderController.userCanceledOrder
);

// router.get(
//   "/:id/:orderId",
//   middlewareController.verifyTokenAndAuthorization,
//   orderController.getOneOrderUser
// );

// Lấy ra số lượng đơn hàng cho từng trạng thái
router.get(
  // "/user-amount-order-status/:id",
  "/user-amount-order-status",
  // middlewareController.verifyTokenAndAuthorization,
  orderController.getAllOrderAmountStatus
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
  middlewareController.verifyTokenAndAuthorization,
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
  // "/order-delivery/:id",
  "/find/order-delivery/:id",
  middlewareController.verifyTokenAndAdmin,
  orderController.adminAcceptDelivery
);

// Admin xoá đơn hàng đã bị huỷ                   // trùng Admin xoá đơn đặt hàng
router.put(
  "/find/order-delete/:id",
  middlewareController.verifyTokenAndAdmin,
  orderController.adminDeleteOrder
);

// Admin xoá đơn đặt hàng                         // trùng Admin xoá đơn hàng đã bị huỷ
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

router.get(
  "/income-year",
  middlewareController.verifyTokenAndAdmin,
  orderController.monthlyofYear
);

// Get all
router.get(
  "/",
  middlewareController.verifyTokenAndAdmin,
  orderController.getAllOrder
);

// Get all amount status order user

router.get(
  // "/amount/:id",
  "/amount2222222/fffffffffff/ffffffffffffffff/fffff",
  // middlewareController.verifyTokenAndAuthorization,
  orderController.getAmount
);

// Admin get all amount status order
router.get(
  "/amount-order-status/",
  // middlewareController.verifyTokenAndAdmin,
  orderController.getAdminAllOrderAmountStatus
);

//GET USER STATS
router.get(
  "/stats",
  middlewareController.verifyTokenAndAdmin,
  orderController.orderStats
);

module.exports = router;
