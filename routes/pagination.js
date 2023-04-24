const paginationController = require("../controllers/paginationController");

const router = require("express").Router();

const PAGE_SIZE = 12;

//GET PRODUCTS FROM PAGINATION
router.get("/", paginationController.getProductPagination);

module.exports = router;
