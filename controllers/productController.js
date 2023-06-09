const Product = require("../models/Product");
const mongoose = require("mongoose");
const Size = require("../models/Size");
const DiscountProduct = require("../models/DiscountProduct");
// const Order = require("../models/Order");
// const Address = require("../models/Address");

const productController = {
  // Tạo sản phẩm
  createProduct: async (req, res) => {
    try {
      const newProduct = new Product({
        title: req.body.title,
        desc: req.body.desc,
        img: req.body.img,
        categories: req.body.categories,
        color: req.body.color,
        price: req.body.price,
      });

      // Tạo đối tượng giảm giá mới nếu có
      let newDiscount = null;
      let discountAmount = 0;
      let expireTimeAt;
      if (req.body.discount && req.body.expireAt) {
        expireTimeAt = new Date(
          Date.now() + req.body.expireAt * 60 * 60 * 1000
        );
        discountAmount = req.body.discount;
      }

      newDiscount = new Discount({
        product_id: newProduct._id,
        discount_amount: discountAmount,
        expireAt: expireTimeAt,
      });

      // Tạo mảng đối tượng kích thước mới
      const newSizes = [
        {
          product_id: newProduct._id,
          size: "S",
          inStock: req.body.sizeS,
        },
        {
          product_id: newProduct._id,
          size: "M",
          inStock: req.body.sizeM,
        },
        {
          product_id: newProduct._id,
          size: "L",
          inStock: req.body.sizeL,
        },
      ];

      // Thực hiện các thao tác tạo mới một cách đồng thời
      const results = await Promise.all([
        newProduct.save(),
        newDiscount && newDiscount.save(),
        Size.insertMany(newSizes),
      ]);

      const savedProduct = results[0];

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

      if (req.body.discount) {
        let expireTimeAt = null;
        if (req.body.expireAt) {
          expireTimeAt = new Date(
            Date.now() + req.body.expireAt * 60 * 60 * 1000
          );
        }

        const findDiscountProduct = await DiscountProduct.findOneAndUpdate(
          {
            product_id: mongoose.Types.ObjectId(req.params.id),
          },
          {
            $set: {
              discount_amount: req.body.discount,
              expireAt: expireTimeAt,
            },
          },
          { upsert: true }
        );
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
      console.time("myTimer");
      const product = await Product.findById(req.params.id)
        .populate("discountProduct_id", "discount_amount")
        .populate("sizes", "size inStock")
        .select(
          "title img categories color price discountProduct_id sizes grandeImg"
        );
      console.timeEnd("myTimer");
      res.status(200).json(product);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // getOne: async (req, res) => {
  //   try {
  //     console.log("req*****", req.params);
  //     const pending = await Order.find({
  //       userId: req.params.id,
  //       // userId: "63b4e6bff1828a3d371fa0ef",
  //       status: "pending",
  //     }).lean();

  //     const accept = await Order.find({
  //       userId: req.params.id,
  //       // userId: "63b4e6bff1828a3d371fa0ef",

  //       status: "accept",
  //     }).lean();

  //     const delivery = await Order.find({
  //       userId: req.params.id,
  //       // userId: "63b4e6bff1828a3d371fa0ef",

  //       status: "delivery",
  //     }).lean();

  //     const complete = await Order.find({
  //       userId: req.params.id,
  //       // userId: "63b4e6bff1828a3d371fa0ef",

  //       status: "complete",
  //     }).lean();

  //     const cancel = await Order.find({
  //       userId: req.params.id,
  //       // userId: "63b4e6bff1828a3d371fa0ef",

  //       status: "cancel",
  //     }).lean();

  //     const findUserAddress = await Address.findOne({
  //       user_id: mongoose.Types.ObjectId(req.params.id),
  //       // user_id: mongoose.Types.ObjectId("63b4e6bff1828a3d371fa0ef"),
  //     })
  //       .select(
  //         "province district ward address province_id district_id ward_id"
  //       )
  //       .lean();

  //     // res.status(200).json({
  //     //   pending: number.pending,
  //     //   accept: number.accept,
  //     //   delivery: number.delivery,
  //     //   complete: number.complete,
  //     //   cancel: number.cancel,
  //     //   address: findUserAddress,
  //     // });

  //     res.status(200).json({
  //       pending: pending.length,
  //       accept: accept.length,
  //       delivery: delivery.length,
  //       complete: complete.length,
  //       cancel: cancel.length,
  //       address: findUserAddress,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json(err);
  //   }
  // },

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
        price: 1,
      };
    } else if (req.query.sort === "desc") {
      sort = {
        price: -1,
      };
    }

    try {
      let products;
      let totalProduct;

      // trước đó
      if (req.query.new) {
        products = await Product.find().sort({ createdAt: -1 }).limit(1);
      } else if (req.query.category === "all") {
        products = await Product.find()
          .sort(sort)
          .skip(quanti)
          .limit(pageSize)
          .populate("discountProduct_id", "discount_amount")
          .populate("sizes", "size inStock")
          .select("title grandeImg img setImg price discountProduct_id sizes");

        totalProduct = await Product.countDocuments();
      }
      // if (req.query.category !== "undefined")
      else {
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
          .select("title grandeImg img setImg price discountProduct_id sizes");

        totalProduct = await Product.countDocuments({
          categories: {
            $in: [req.query.category],
          },
        });
      }
      // console.log("totalProduct", totalProduct);
      // console.log("products", products);
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

  getAllProductHome: async (req, res) => {
    // console.log("có");
    const sort = {
      createdAt: -1,
    };

    try {
      let products;

      products = await Product.find()
        .sort(sort)
        .limit(12)
        .populate("discountProduct_id", "discount_amount")
        .populate("sizes", "size inStock")
        .select("title setImg grandeImg price discountProduct_id sizes");

      res.status(200).json(products);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getSimilarProduct: async (req, res) => {
    const sort = {
      createdAt: -1,
    };
    let products;
    try {
      products = await Product.find({
        categories: {
          $in: [req.query.category],
        },
      })
        .sort(sort)
        .limit(4)
        .populate("discountProduct_id", "discount_amount")
        .populate("sizes", "size inStock")
        .select("title price discountProduct_id sizes setImg grandeImg");
      res.status(200).json(products);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // updateSrc: async (req, res) => {
  //   try {
  //     const updateProduct = await Product.updateOne(
  //       { _id: req.params.id },
  //       {
  //         grandeImg: req.body.img,
  //       },
  //       { upsert: true }
  //     );

  //     const product = await Product.findOne({ _id: req.params.id });

  //     res.status(200).json(product);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },

  // test model size
  //  createSize: async (req, res) => {
  //   try {
  //     const size = new Size({
  //       size: req.body.size,
  //       inStock: req.body.inStock,
  //     });

  //     await size.save();
  //     res.status(200).json(size);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },

  // createSize: async (req, res) => {
  //   try {
  //     const newSizeS = new Size({
  //       product_id: req.params.id,
  //       size: "S",
  //       inStock: 10,
  //     });

  //     const newSizeM = new Size({
  //       product_id: req.params.id,
  //       size: "M",
  //       inStock: 0,
  //     });

  //     const newSizeL = new Size({
  //       product_id: req.params.id,
  //       size: "L",
  //       inStock: 10,
  //     });

  //     await newSizeS.save();
  //     await newSizeM.save();
  //     await newSizeL.save();

  //     res
  //       .status(200)
  //       .json({ newSizeS: newSizeS, newSizeM: newSizeM, newSizeL: newSizeL });
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },

  //  addSize: async (req, res) => {
  //   try {
  //     const product = await Product.updateOne(
  //       {
  //         _id: req.params.id,
  //       },
  //       {
  //         $push: { sizes: req.body.size_id },
  //         $set: { discountProduct_id: req.body.discount },
  //       },
  //       { new: true }
  //     );

  //     // await discount_amount.save();
  //     res.status(200).json(product);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },

  // addSize: async (req, res) => {
  //   try {
  //     const newSizeS = await Size.findOne({
  //       product_id: mongoose.Types.ObjectId(req.params.id),
  //       size: "S",
  //     });

  //     const newSizeM = await Size.findOne({
  //       product_id: mongoose.Types.ObjectId(req.params.id),
  //       size: "M",
  //     });

  //     const newSizeL = await Size.findOne({
  //       product_id: mongoose.Types.ObjectId(req.params.id),
  //       size: "L",
  //     });

  //     const newSizes = []; // khởi tạo mảng mới để lưu các ObjectId của document Size
  //     if (newSizeS) {
  //       newSizes.push(newSizeS._id); // thêm ObjectId của document Size S vào mảng newSizes nếu newSizeS không null
  //     }
  //     if (newSizeM) {
  //       newSizes.push(newSizeM._id); // thêm ObjectId của document Size M vào mảng newSizes nếu newSizeM không null
  //     }
  //     if (newSizeL) {
  //       newSizes.push(newSizeL._id); // thêm ObjectId của document Size L vào mảng newSizes nếu newSizeL không null
  //     }

  //     const findProduct = await Product.updateOne(
  //       { _id: mongoose.Types.ObjectId(req.params.id) },
  //       { $set: { sizes: newSizes } },
  //       { new: true }
  //     );

  //     const find = await Product.findOne({
  //       _id: mongoose.Types.ObjectId(req.params.id),
  //     });
  //     console.log("find", find);

  //     res.status(200).json(findProduct);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },

  // addDiscount: async (req, res) => {
  //   try {
  //     console.log(req.params, req.body);
  //     const product = await Product.findOne({
  //       _id: mongoose.Types.ObjectId(req.params.id),
  //     });

  //     const newDiscount = new DiscountProduct({
  //       product_id: product._id,
  //       discount_amount: req.body.discount,
  //       expireAt: null,
  //     });

  //     await newDiscount.save();

  //     const findProduct = await Product.updateOne(
  //       { _id: mongoose.Types.ObjectId(req.params.id) },
  //       { $set: { discountProduct_id: newDiscount._id } },
  //       { new: true }
  //     );

  //     res
  //       .status(200)
  //       .json({ newDiscount: newDiscount, findProduct: findProduct });
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // },
};

module.exports = productController;
