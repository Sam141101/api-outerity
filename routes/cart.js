const cartController = require("../controllers/cartController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

//CREATE
router.post(
  "/",
  middlewareController.verifyToken,
  cartController.addProductToCart
);

//UPDATE
router.put("/:id", middlewareController.verifyToken, cartController.updateCart);

//DELETE
router.delete(
  "/:id",
  middlewareController.verifyToken,
  cartController.deleteProductInCart
);

//GET USER CART
router.get(
  "/find/:id",
  middlewareController.verifyTokenAndAuthorization,
  cartController.getUserCart
);

// //GET ALL
router.get(
  "/",
  middlewareController.verifyTokenAndAdmin,
  cartController.getAllCart
);

module.exports = router;
