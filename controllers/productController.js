const User = require("../models/User");
const Product = require("../models/Product");

const PAGE_SIZE = 12;

const productController = {
  // Tạo sản phẩm
  createProduct: async (req, res) => {
    const newProduct = new Product(req.body);
    try {
      const savedProduct = await newProduct.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Cập nhật sản phẩm
  updateProduct: async (req, res) => {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Xoá sản phẩm
  deleteProduct: async (req, res) => {
    try {
      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json("Product has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy ra 1 sản phẩm theo id
  getOneProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).lean();
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Lấy ra tất cả sản phẩm
  getAllProduct: async (req, res) => {
    let page = req.query.page;
    const pageSize = parseInt(req.query.limit);
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }
    let quanti = (page - 1) * pageSize;

    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
      let products;

      if (qNew) {
        products = await Product.find().sort({ createdAt: -1 }).limit(1);
      } else if (qCategory) {
        products = await Product.find({
          categories: {
            $in: [qCategory],
          },
        })
          // .sort({ createdAt: -1 })
          .skip(quanti)
          .limit(pageSize);
      } else {
        products = await Product.find();
      }

      const total = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });

      const totalProduct = total.length;

      const pagi = {
        page: page,
        totalRows: totalProduct,
        limit: pageSize,
      };

      const results = {
        resultProducts: products,
        pagi: pagi,
      };

      res.status(200).json(results);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = productController;
