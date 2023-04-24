const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userController");

const router = require("express").Router();

//UPDATE
router.put(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  userController.updateUser
);

//DELETE
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  userController.deleteUser
);

// Admin ----------------------------------------------------------------

//GET USER
router.get(
  "/find/:id",
  middlewareController.verifyTokenAndAdmin,
  userController.getOneUser
);

router.get(
  "/check-user/:id",
  middlewareController.verifyTokenAndAdmin,
  userController.checkUser
);

//GET ALL USER
router.get(
  "/",
  middlewareController.verifyTokenAndAdmin,
  userController.getAllUser
);

//GET USER STATS
router.get(
  "/stats",
  middlewareController.verifyTokenAndAdmin,
  userController.userStats
);

// lấy các user có số đơn hàng nhiều nhất ra
router.get(
  "/find-user-high-order",
  middlewareController.verifyTokenAndAdmin,
  userController.getUserHighOrder
);

// lấy các user hay huỷ đơn đơn hàng
router.get(
  "/find-users-canceled",
  middlewareController.verifyTokenAndAdmin,
  userController.getUserCanceledOrder
);

module.exports = router;
