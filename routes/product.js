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

module.exports = router;
