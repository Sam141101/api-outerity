const Product = require("../models/Product");

const searchController = {
  // Lấy ra 5 sản phẩm tìm kiếm
  search: async (req, res) => {
    try {
      if (!req.query.search) {
        return;
      }
      function toUpperCase(str) {
        return str.toUpperCase();
      }

      // const search = await Product.aggregate([
      //   {
      //     $search: {
      //       index: "custom1",
      //       compound: {
      //         should: [
      //           {
      //             autocomplete: {
      //               path: "title",
      //               query: req.query.search,
      //             },
      //           },
      //           {
      //             text: {
      //               path: "title",
      //               query: req.query.search,
      //               fuzzy: { maxEdits: 1 },
      //             },
      //           },
      //         ],
      //         minimumShouldMatch: 1,
      //       },
      //     },
      //   },
      //   {
      //     $lookup: {
      //       from: "discountproducts",
      //       localField: "discountProduct_id",
      //       foreignField: "_id",
      //       as: "discountProducts",
      //     },
      //   },
      //   {
      //     $limit: 5,
      //   },
      // ]).project({
      //   _id: 1,
      //   title: 1,
      //   categories: 1,
      //   img: 1,
      //   color: 1,
      //   imageUrl: 1,
      //   price: 1,
      //   discountProduct_id: 1,
      //   discount_amount: {
      //     $arrayElemAt: ["$discountProducts.discount_amount", 0],
      //   },
      // });

      const search = await Product.aggregate([
        {
          $search: {
            index: "custom2",
            compound: {
              should: [
                {
                  autocomplete: {
                    path: "title",
                    query: req.query.search,
                  },
                },
                {
                  text: {
                    path: "title",
                    query: req.query.search,
                    fuzzy: { maxEdits: 1 },
                  },
                },
                {
                  text: {
                    path: "color",
                    query: req.query.search,
                    fuzzy: { maxEdits: 1 },
                  },
                },
                {
                  $unwind: {
                    path: "$categories",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  text: {
                    path: "categories",
                    query: req.query.search,
                    fuzzy: { maxEdits: 1 },
                  },
                },
              ],
              minimumShouldMatch: 1,
            },
          },
        },
        {
          $lookup: {
            from: "discountproducts",
            localField: "discountProduct_id",
            foreignField: "_id",
            as: "discountProducts",
          },
        },
        {
          $project: {
            title: 1,
            imageUrl: "$img",
            categories: 1,
            color: 1,
            price: 1,
            discountProduct_id: 1,
            discount_amount: {
              $arrayElemAt: ["$discountProducts.discount_amount", 0],
            },
          },
        },
        {
          $addFields: {
            discount_amount: { $ifNull: ["$discount_amount", 0] },
          },
        },
        {
          $limit: 5,
        },
      ]);

      console.log("search", search);

      res.status(200).json(search);
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  //   Lấy ra tất cả sản phẩm tìm kiếm
  searchAll: async (req, res) => {
    try {
      const searchQuery = req.query.search;
      const decodedQuery = decodeURIComponent(searchQuery).toLowerCase();

      let page = req.query.page;
      const pageSize = parseInt(req.query.limit);
      page = parseInt(page);
      if (page < 1) {
        page = 1;
      }
      let quanti = (page - 1) * pageSize;

      const products = await Product.find({
        $or: [
          { title: { $regex: decodedQuery, $options: "i" } },
          { categories: { $regex: decodedQuery, $options: "i" } },
          { color: { $regex: decodedQuery, $options: "i" } },
        ],
      })
        .skip(quanti)
        .limit(pageSize)
        .populate("discountProduct_id", "discount_amount")
        .populate("sizes", "size inStock")
        .select("title img price discountProduct_id sizes");

      let totalProduct = await Product.countDocuments({
        $or: [
          { title: { $regex: decodedQuery, $options: "i" } },
          { categories: { $regex: decodedQuery, $options: "i" } },
          { color: { $regex: decodedQuery, $options: "i" } },
        ],
      });

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
};

module.exports = searchController;
