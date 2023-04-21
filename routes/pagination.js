const paginationController = require("../controllers/paginationController");

const router = require("express").Router();

const PAGE_SIZE = 12;

//GET PRODUCTS FROM PAGINATION
router.get("/", paginationController.getProductPagination);

module.exports = router;

// //GET PRODUCTS FROM PAGINATION
// router.get("/", async (req, res) => {
//   try {
//     let page = req.query.page;
//     const pageSize = parseInt(req.query.limit);
//     page = parseInt(page);
//     if (page < 1) {
//       page = 1;
//     }

//     let quanti = (page - 1) * pageSize;

//     const resultProducts = await Product.find({})
//       // .sort({ createdAt: -1 })
//       .skip(quanti)
//       .limit(pageSize);

//     const total = await Product.find({});

//     const totalProduct = total.length;

//     const pagi = {
//       page: page,
//       totalRows: totalProduct,
//       limit: pageSize,
//     };

//     const results = {
//       resultProducts: resultProducts,
//       pagi: pagi,
//     };

//     res.status(200).json(results);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
