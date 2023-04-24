const middlewareController = require("../controllers/middlewareController");
const receiveController = require("../controllers/receiveController");

const router = require("express").Router();

router.post(
  "/pay",
  middlewareController.verifyToken,
  receiveController.receive
);

module.exports = router;
