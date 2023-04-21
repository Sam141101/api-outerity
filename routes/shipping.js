const middlewareController = require("../controllers/middlewareController");
const shippingController = require("../controllers/shippingController");
// const productController = require("../controllers/productController");

const router = require("express").Router();

// Lấy ra giá dịch vụ
router.post(
  "/service-charge/:id",
  middlewareController.verifyTokenAndAuthorization,
  shippingController.getServiceCharge
);

// Lấy ra gói dịch vụ
router.get(
  "/service-pack/:id",
  middlewareController.verifyTokenAndAuthorization,
  shippingController.getServicePack
);

//GET List TỈNH / THÀNH
router.get(
  "/list-province",
  // middlewareController.verifyTokenAndAuthorization,
  shippingController.getListProvince
);

//GET List QUẬN / HUYỆN
router.post(
  "/list-district",
  // middlewareController.verifyTokenAndAuthorization,
  shippingController.getListDistrict
);

//GET List PHƯỜNG / XÃ
router.post(
  "/list-ward",
  // middlewareController.verifyTokenAndAuthorization,
  shippingController.getListWard
);

// Danh sách ca shipper lấy hàng

router.get(
  "/list-delivery-time/:id",
  middlewareController.verifyTokenAndAdmin,
  shippingController.getListDeliveryTime
);

module.exports = router;
