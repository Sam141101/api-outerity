const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const Size = require("../models/Size");
const DiscountProduct = require("../models/DiscountProduct");

const PAGE_SIZE = 12;

const productController = {
  // Tạo sản phẩm
  createProduct: async (req, res) => {
    try {
      // if (
      //   !req.body.title ||
      //   !req.body.desc ||
      //   !req.body.img ||
      //   !req.body.categories ||
      //   !req.body.color ||
      //   !req.body.sizeS ||
      //   !req.body.sizeM ||
      //   !req.body.sizeL
      // ) {
      //   res.status(200).json("Vui lòng điền đẩy đủ các thông tin");
      // }

      const requiredFields = [
        "title",
        "desc",
        "img",
        "categories",
        "color",
        "sizeS",
        "sizeM",
        "sizeL",
      ];
      if (!requiredFields.every((field) => req.body[field])) {
        return res.status(200).json("Vui lòng điền đẩy đủ các thông tin");
      }

      const newProduct = new Product({
        title: req.body.title,
        desc: req.body.desc,
        img: req.body.img,
        categories: req.body.categories,
        color: req.body.color,
        price: req.body.price,
      });

      let expireTimeAt = null;

      if (req.body.discount && req.body.expireAt) {
        expireTimeAt = new Date(
          Date.now() + req.body.expireAt * 60 * 60 * 1000
        );
      }

      const newDiscount = new Discount({
        product_id: newProduct._id,
        discount_amount: req.body.discount,
        expireAt: expireTimeAt,
      });

      await newDiscount.save();

      const newSizeS = new Size({
        product_id: newProduct._id,
        size: "S",
        inStock: req.body.sizeS,
      });

      await newSizeS.save();

      const newSizeM = new Size({
        product_id: newProduct._id,
        size: "M",
        inStock: req.body.sizeM,
      });
      await newSizeM.save();

      const newSizeL = new Size({
        product_id: newProduct._id,
        size: "L",
        inStock: req.body.sizeL,
      });

      await newSizeL.save();

      const savedProduct = await newProduct.save();
      res.status(200).json(savedProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Cập nhật sản phẩm
  updateProduct: async (req, res) => {
    try {
      const { sizeS, sizeM, sizeL } = req.body;

      if (sizeS || sizeM || sizeL) {
        const sizesToUpdate = [];

        // Kiểm tra từng size và lấy danh sách các size cần cập nhật vào mảng sizesToUpdate
        if (sizeS) {
          sizesToUpdate.push({ size: "S", inStock: sizeS });
        }
        if (sizeM) {
          sizesToUpdate.push({ size: "M", inStock: sizeM });
        }
        if (sizeL) {
          sizesToUpdate.push({ size: "L", inStock: sizeL });
        }

        // Cập nhật số lượng và giá cho các size trong danh sách sizesToUpdate
        for (let i = 0; i < sizesToUpdate.length; i++) {
          const { size, inStock } = sizesToUpdate[i];
          await Size.findOneAndUpdate(
            {
              product_id: req.params.id,
              size,
            },
            {
              $set: { inStock },
            },
            { upsert: true }
          );
        }
      }

      // let findProduct = await Product.findOne({ _id: req.params.id }).lean();

      // if (req.body.title) {
      //   findProduct.title = req.body.title;
      // }

      // if (req.body.desc) {
      //   findProduct.desc = req.body.desc;
      // }

      // if (req.body.img) {
      //   findProduct.img = req.body.img;
      // }

      // if (req.body.color) {
      //   findProduct.color = req.body.color;
      // }

      // if (req.body.price) {
      //   findProduct.price = req.body.price;
      // }

      // if (req.body.categories) {
      //   findProduct.categories = req.body.categories;
      // }

      if (req.body.discount) {
        const findDiscountProduct = await DiscountProduct.findOne({
          product_id: mongoose.Types.ObjectId(req.params.id),
        });

        let expireTimeAt;

        if (findDiscountProduct) {
          findDiscountProduct.discount_amount = req.body.discount;
          if (req.body.expireAt) {
            // req.body.expireAt số tiếng
            if (req.body.expireAt === 0) {
              expireTimeAt = null;
            } else {
              expireTimeAt = new Date(
                Date.now() + req.body.expireAt * 60 * 60 * 1000
              );
            }
            findDiscountProduct.expireAt = expireTimeAt;
            await findDiscountProduct.save();
          }
        } else {
          if (req.body.expireAt === 0) {
            expireTimeAt = null;
          } else {
            expireTimeAt = new Date(
              Date.now() + req.body.expireAt * 60 * 60 * 1000
            );
          }
          const newDiscount = new DiscountProduct({
            discount_amount: req.body.discount,
            expireAt: expireTimeAt,
          });

          await newDiscount.save();
        }
      }

      const updateProduct = await Product.updateOne(
        { _id: req.params.id },
        {
          title: req.body.title,
          desc: req.body.desc,
          img: req.body.img,
          categories: req.body.categories,
          color: req.body.color,
          price: req.body.price,
        },
        { upsert: true }
      );

      // await findProduct.save();

      res.status(200).json("Cập nhật thông tin sản phẩm thành công.");
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
      const product = await Product.findById(req.params.id)
        .populate("discountProduct_id", "discount_amount")
        .populate("sizes", "size inStock")
        .select("title img categories color price discountProduct_id sizes");
      console.log(product);
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // test model size
  createSize: async (req, res) => {
    try {
      const size = new Size({
        size: req.body.size,
        inStock: req.body.inStock,
      });

      await size.save();
      res.status(200).json(size);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // test model size
  addSize: async (req, res) => {
    try {
      const product = await Product.updateOne(
        {
          _id: req.params.id,
        },
        {
          $push: { sizes: req.body.size_id },
          $set: { discountProduct_id: req.body.discount },
        },
        { new: true }
      );

      // await discount_amount.save();
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Lấy ra tất cả sản phẩm
  getAllProduct: async (req, res) => {
    // Xử lí số trang hiện tại
    console.log("req", req.query);
    let page = req.query.page;
    const pageSize = parseInt(req.query.limit);
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }
    let quanti = (page - 1) * pageSize;

    // Xử lí sort
    let sort;
    if (req.query.sort === "newest") {
      sort = {
        createdAt: -1,
      };
    } else if (req.query.sort === "asc") {
      sort = {
        price: -1,
      };
    } else if (req.query.sort === "desc") {
      sort = {
        price: 1,
      };
    }

    try {
      let products;
      let totalProduct;

      if (req.query.new) {
        products = await Product.find().sort({ createdAt: -1 }).limit(1);
      } else if (req.query.category !== "undefined") {
        products = await Product.find({
          categories: {
            $in: [req.query.category],
          },
        })
          .sort(sort)
          .skip(quanti)
          .limit(pageSize)

          .populate("discountProduct_id", "discount_amount")
          .populate("sizes", "size inStock")
          // .populate({
          //   path: "discountProduct_id",
          // })
          .select("title img price discountProduct_id sizes");

        totalProduct = await Product.find({
          categories: {
            $in: [req.query.category],
          },
        }).lean();
      } else {
        products = await Product.find()
          .sort(sort)
          .skip(quanti)
          .limit(pageSize)
          .populate("discountProduct_id", "discount_amount")
          .populate("sizes", "size inStock")
          // .populate({
          //   path: "discountProduct_id",
          // })
          .select("title img price discountProduct_id sizes");

        totalProduct = await Product.find().lean();
      }

      // console.log("products", products);

      const pagi = {
        page: page,
        totalRows: totalProduct.length,
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

  getAllProductList: async (req, res) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getDiscountProduct: async (req, res) => {
    try {
      const findDiscount = await DiscountProduct.findOne({
        product_id: mongoose.Types.ObjectId(req.params.id),
      })
        .select("discount_amount")
        .lean();

      if (!findDiscount) return res.status(200).json(0);

      console.log("findDiscount", findDiscount);
      res.status(200).json(findDiscount);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getDiscountProductAndSize: async (req, res) => {
    try {
      const findDiscount = await DiscountProduct.findOne({
        product_id: mongoose.Types.ObjectId(req.params.id),
        // product_id: req.params.id,
      })
        .select("discount_amount")
        .lean();

      let expireAt;
      if (findDiscount.expireAt == null) {
        expireAt = 0;
        // console.log("fff");
      } else {
        const expireTimeUnix = findDiscount.expireAt.getTime();
        const now = Date.now();
        expireAt = Math.round((expireTimeUnix - now) / (60 * 60 * 1000));
      }

      let discount = { ...findDiscount, expireAt: expireAt };
      // console.log("discount", discount);
      const findSizes = await Size.find({
        product_id: mongoose.Types.ObjectId(req.params.id),
      })
        .select("size inStock")
        .lean();

      res.status(200).json({ findDiscount: discount, findSizes: findSizes });
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = productController;
