const middlewareController = require("../controllers/MiddlewareController");
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

//DELETE
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdmin,
  productController.deleteProduct
);

//GET PRODUCT
router.get("/find/:id", productController.getOneProduct);

const PAGE_SIZE = 12;

//GET ALL PRODUCTS
router.get("/", productController.getAllProduct);

module.exports = router;

//CREATE
// router.post("/", verifyTokenAndAdmin, async (req, res) => {
//   const newProduct = new Product(req.body);
//   try {
//     const savedProduct = await newProduct.save();
//     res.status(200).json(savedProduct);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //UPDATE
// router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedProduct);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //DELETE
// router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     res.status(200).json("Product has been deleted...");
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //GET PRODUCT
// router.get("/find/:id", async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).lean();
//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// const PAGE_SIZE = 12;

// //GET ALL PRODUCTS
// router.get("/", async (req, res) => {
//   let page = req.query.page;
//   const pageSize = parseInt(req.query.limit);
//   page = parseInt(page);
//   if (page < 1) {
//     page = 1;
//   }
//   let quanti = (page - 1) * pageSize;

//   const qNew = req.query.new;
//   const qCategory = req.query.category;
//   try {
//     let products;

//     if (qNew) {
//       products = await Product.find().sort({ createdAt: -1 }).limit(1);
//     } else if (qCategory) {
//       products = await Product.find({
//         categories: {
//           $in: [qCategory],
//         },
//       })
//         // .sort({ createdAt: -1 })
//         .skip(quanti)
//         .limit(pageSize);
//     } else {
//       products = await Product.find();
//     }

//     const total = await Product.find({
//       categories: {
//         $in: [qCategory],
//       },
//     });

//     const totalProduct = total.length;

//     const pagi = {
//       page: page,
//       totalRows: totalProduct,
//       limit: pageSize,
//     };

//     const results = {
//       resultProducts: products,
//       pagi: pagi,
//     };

//     res.status(200).json(results);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
