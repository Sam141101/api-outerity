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

router.put("/src/:id", productController.updateSrc);

//DELETE
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  productController.deleteProduct
);

//GET PRODUCT
router.get("/find/:id", productController.getOneProduct);

router.get("/get/:id", productController.getOne);

//GET ALL PRODUCTS
router.get("/", productController.getAllProduct);
router.get("/list-product", productController.getAllProductList); // chưa được sử dụng

router.get("/discount-product/:id", productController.getDiscountProduct);

router.get(
  "/size-discount-product/:id",
  productController.getDiscountProductAndSize
);

// làm cho riêng trang home
router.get("/home/", productController.getAllProductHome);
router.get("/similar/", productController.getSimilarProduct);

// test model size
// router.post("/create-size/", productController.createSize);
// router.post("/add-size/:id", productController.addSize);
router.get("/mm/:id", productController.addDiscount);
// router.get("/size/:id", productController.createSize);
// router.get("/add-size/:id", productController.addSize);

module.exports = router;
