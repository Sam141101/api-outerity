const middlewareController = require("../controllers/middlewareController");
const commentController = require("../controllers/commentController");

const router = require("express").Router();

//CREATE
router.post(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  commentController.addComment
);

//UPDATE
router.put(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  commentController.updateComment
);

//DELETE
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  commentController.deleteComment
);

// //GET COMMENT
router.get("/find/:id/:option", commentController.getUserComment);

module.exports = router;
