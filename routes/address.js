const middlewareController = require("../controllers/MiddlewareController");
const addressController = require("../controllers/addressController");
const shippingController = require("../controllers/shippingController");
// const productController = require("../controllers/productController");

const router = require("express").Router();

// Thêm địa chỉ mới
router.post(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  addressController.createAddress
);

router.put(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  addressController.updateAddress
);

// Lấy ra địa chỉ của người dùng
router.get(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  addressController.getUserAddress
);

module.exports = router;
