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

      //   // $or: [{ title: { $regex: req.query.search } }],

      //   $or: [
      //     {
      //       title: {
      //         $regex: req.query.search,
      //         // $regex: `/\\s+${req.query.search}\s+/i`,
      //         // $options: "i",
      //       },
      //     },
      //     {
      //       title: {
      //         // $regex: `/\\s+${toUpperCase(req.query.search)}\s+/i`,
      //         $regex: toUpperCase(req.query.search),
      //         // $options: "i",
      //       },
      //     },
      //     // { categories: { $regex: toUpperCase(req.query.search) } },
      //   ],

      //   // $or: [{ title: { $regex: req.query.search } }],
      //   // categories: req.query.search,
      // }).limit(5);

      // console.log(data);

      // console.log(search);

      const search = await Product.aggregate([
        {
          $search: {
            index: "custom1",
            // index: "custom2",

            compound: {
              should: [
                {
                  autocomplete: {
                    path: "title",
                    query: req.query.search,
                    // "score": { "boost": { "value": 3}}
                  },
                },

                {
                  text: {
                    path: "title",
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
          $limit: 5,
        },
      ]);

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
      //     $match: {
      //       categories: req.query.category,
      //     },
      //   },
      //   {
      //     $limit: 5,
      //   },
      // ]);

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
