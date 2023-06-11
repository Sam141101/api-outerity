const router = require("express").Router();
const authController = require("../controllers/authController");
const middlewareController = require("../controllers/middlewareController");

// Dùng phương thức token authentication
// ---------------------- Xác thực gmail để đăng kí ----------------
router.post("/confirm/register", authController.confirmRegisterUser);

router.get("/:id/verify/:token/", authController.verifyLink);
// ----------------------------------------------------------------

//REGISTER
router.post("/register", authController.register);

// ------------ Quên mật khẩu -----------------------
router.post("/forgot-password", authController.forgotPassword);

router.get(
  "/reset-password/:id/:token/",
  authController.verifyLinkResetPassword
);

router.post("/new-password", authController.newPassword);

// ----------------------------------------------------------------

//LOGIN
router.post("/login", authController.login);

// REFRESH
router.post(
  "/refresh/:id",
  // middlewareController.verifyTokenAndAuthorization,
  authController.refreshToken
);

// LOG OUT
router.post("/logout", middlewareController.verifyToken, authController.logout);

router.post(
  "/change-password/:id",
  middlewareController.verifyTokenAndAuthorization,
  authController.changePassword
);
module.exports = router;
