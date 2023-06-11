const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const paypalController = require("../controllers/paypalController");

router.post("/pay", middlewareController.verifyToken, paypalController.payment);

// //GET
router.get("/success", paypalController.paymentSuccess);

router.get("/cancel", paypalController.paymentCancel);

module.exports = router;
