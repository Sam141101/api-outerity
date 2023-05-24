const middlewareController = require("../controllers/middlewareController");
const productController = require("../controllers/productController");

const router = require("express").Router();

//CREATE
router.post(
  "/",
  middlewareController.verifyTokenAndAdmin,
  productController.createProduct
);

//UPDATE
router.put(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  productController.updateProduct
);

//DELETE
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  productController.deleteProduct
);

//GET PRODUCT
router.get("/find/:id", productController.getOneProduct);

const PAGE_SIZE = 12;

//GET ALL PRODUCTS
router.get("/", productController.getAllProduct);
router.get("/list-product", productController.getAllProductList); // chưa được sử dụng

router.get("/discount-product/:id", productController.getDiscountProduct);

// test model size
router.post("/create-size/", productController.createSize);
router.post("/add-size/:id", productController.addSize);
router.get("/add-discount/:id", productController.addDiscount);

router.get(
  "/size-discount-product/:id",
  productController.getDiscountProductAndSize
);

router.get("/size/:id", productController.createSize);
router.get("/add-size/:id", productController.addSize);

// làm cho riêng trang home
router.get("/home/", productController.getAllProductHome);

module.exports = router;
