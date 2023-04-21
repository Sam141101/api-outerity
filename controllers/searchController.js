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

      res.status(200).json(search);
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  //   Lấy ra tất cả sản phẩm tìm kiếm
  searchAll: async (req, res) => {
    let page = req.query.page;
    page = parseInt(page);
    if (page < 1) {
      page = 1;
    }
    let quanti = (page - 1) * PAGE_SIZE;

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
          .skip(quanti)
          .limit(PAGE_SIZE);
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
