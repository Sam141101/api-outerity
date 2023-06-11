const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const addressController = require("../controllers/addressController");
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
