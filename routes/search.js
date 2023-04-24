const searchController = require("../controllers/searchController");

const router = require("express").Router();

//GET PRODUCT
router.get("/", searchController.search);

//GET ALL CATE
router.get("/find/", searchController.searchAll);

module.exports = router;
