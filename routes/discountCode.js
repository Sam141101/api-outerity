const middlewareController = require("../controllers/middlewareController");
const discountController = require("../controllers/discountController");

const router = require("express").Router();

// User ----------------------------------------------------

// Lấy ra các mã giảm giá mà người cùng có
router.get(
  "/coupon/find/:id/:option",
  middlewareController.verifyTokenAndAuthorization,
  discountController.getDiscountUser
);

// Client sử dụng 1 mã giảm giá
router.get(
  "/use-coupon/:id/:couponCode/:priceOrder",
  middlewareController.verifyTokenAndAuthorization,
  discountController.checkDiscount
);

// Admin -----------------------------------

// Admin xoá mã giảm giá
router.delete(
  "/delete/:id",
  middlewareController.verifyTokenAndAdmin,
  discountController.deleteDiscount
);

// Lấy 1 mã giảm giá ra xem theo _id
router.get(
  "/find/:id",
  middlewareController.verifyTokenAndAdmin,
  discountController.getDiscountId
);

// Admin tạo mã giảm giá cho tất cả người dùng có thể sử dụng
router.post(
  "/everybody-use",
  middlewareController.verifyTokenAndAdmin,
  discountController.createPeopleUse
);

// Admin tạo mã giảm giá cho riêng 1 cá nhân
router.post(
  "/person-use/:id",
  middlewareController.verifyTokenAndAdmin,
  discountController.createPersonUse
);

// Mã giảm giá cho riêng 1 cá nhân đã mua hàng được 1 lần
router.put(
  "/purchased-once/:id",
  middlewareController.verifyTokenAndAuthorization,
  discountController.discountPurchasedOnce
);

// Admin sửa đổi thông tin mã giảm giá
router.put(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  discountController.updateDiscount
);

// Admin check xem code đã tồn tại chưa
router.get(
  "/check-code/:id",
  middlewareController.verifyTokenAndAdmin,
  discountController.checkCode
);

// Lấy ra discount theo từng select
router.get(
  "/list/:select",
  middlewareController.verifyTokenAndAdmin,
  discountController.getDiscountSelect
);

module.exports = router;
