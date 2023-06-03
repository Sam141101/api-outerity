const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const ListProduct = require("../models/ListProduct");

const cartController = {
  // Thêm sản phẩm vào giỏ hàng
  // addProductToCart: async (req, res) => {
  //   try {
  //     console.time("myTimer");

  //     // Tìm tới user trong mảng user
  //     const user = await User.findOne({ _id: req.body.userId }).lean();
  //     // Tìm tới user trong mảng user
  //     const cart = await Cart.findOne({ _id: user.cart_id._id }).lean();

  //     // // Lấy ra được giá tiền của sản phẩm     // req.body.product_id
  //     let price;
  //     const getProduct_id = await Product.findOne({ _id: req.body.product_id })
  //       .populate("discountProduct_id", "discount_amount")
  //       .populate("sizes", "size inStock");

  //     if (Number(req.body.discount) > 0) {
  //       price = getProduct_id.price * (1 - Number(req.body.discount) / 100);
  //     } else {
  //       price = getProduct_id.price;
  //     }

  //     // console.log("getProduct_id", getProduct_id);

  //     // console.log("price", price);
  //     // const price = getProduct_id.price;

  //     // --------------- kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa ở trong Cart ----------------

  //     const checkListProduct = await Cart.findOne({
  //       _id: user.cart_id,
  //     }).populate({
  //       path: "list_product",
  //     });

  //     let test = checkListProduct.list_product.filter(
  //       (item) =>
  //         item.product_id == req.body.product_id &&
  //         item.size == req.body.size_sp
  //     );

  //     if (test.length === 0) {
  //       console.log("không");
  //       // tạo ra 1 { list product }

  //       const newListProduct = new ListProduct({
  //         cart_id: cart._id,
  //         product_id: req.body.product_id,
  //         quantity: req.body.quantity_sp,
  //         size: req.body.size_sp,
  //         price: price * req.body.quantity_sp,
  //       });

  //       await newListProduct.save();

  //       // cập nhật lại giỏ hàng
  //       const currentTotalQuanti = cart.total_quantity;
  //       let newTotalQuanti = currentTotalQuanti + 1;

  //       const currentTotalPrice = cart.total_price;
  //       let newTotalPrice = currentTotalPrice + req.body.quantity_sp * price;

  //       const updateCart = await Cart.updateOne(
  //         { _id: user.cart_id._id },
  //         {
  //           $push: { list_product: newListProduct._id },
  //           $set: {
  //             total_quantity: newTotalQuanti,
  //             total_price: newTotalPrice,
  //           },
  //         },
  //         { new: true }
  //       );
  //     } else {
  //       console.log("có");
  //       // cập nhật lại số lượng sản phẩm
  //       const getQuanti = await ListProduct.findOne({
  //         cart_id: cart._id,
  //         product_id: req.body.product_id,
  //       });
  //       const currentQuanti = getQuanti.quantity;
  //       let newQuanti = currentQuanti + req.body.quantity_sp;

  //       // cập nhật lại giá tiền sản phẩm
  //       const currentPrice = getQuanti.price;
  //       let newPrice = currentPrice + req.body.quantity_sp * price;

  //       const updateListProduct = await ListProduct.updateOne(
  //         { cart_id: cart._id, product_id: req.body.product_id },
  //         {
  //           $set: { quantity: newQuanti, price: newPrice },
  //         }
  //       );
  //       // cập nhật lại giỏ hàng
  //       const currentTotalPrice = cart.total_price;
  //       let newTotalPrice = currentTotalPrice + req.body.quantity_sp * price;

  //       const updateCart = await Cart.updateOne(
  //         { _id: user.cart_id._id },
  //         {
  //           $set: {
  //             total_price: newTotalPrice,
  //           },
  //         },
  //         { new: true }
  //       );
  //     }

  //     const getCart = await Cart.findOne({ _id: user.cart_id._id });
  //     console.log("sut thanh cong");
  //     console.timeEnd("myTimer");

  //     res.status(200).json(getCart);
  //     // res.status(200).json("getCart");
  //   } catch (err) {
  //     console.log("failer");
  //     res.status(500).json(err);
  //   }
  // },

  addProductToCart: async (req, res) => {
    try {
      console.time("myTimer");
      const user = await User.findOne({ _id: req.body.userId }).lean();
      let cart = await Cart.findOne({ _id: user.cart_id._id }).populate({
        path: "list_product",
      });

      // Lấy ra được giá tiền của sản phẩm     // req.body.product_id
      let price;
      const getProduct_id = await Product.findOne({
        _id: req.body.product_id,
      }).populate("discountProduct_id", "discount_amount");

      if (Number(req.body.discount) > 0) {
        price = getProduct_id.price * (1 - Number(req.body.discount) / 100);
      } else {
        price = getProduct_id.price;
      }

      // // --------------- kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa ở trong Cart ----------------
      let test = cart.list_product.filter(
        (item) =>
          item.product_id == req.body.product_id &&
          item.size == req.body.size_sp
      );

      if (test.length === 0) {
        console.log("không");
        const newListProduct = new ListProduct({
          cart_id: cart._id,
          product_id: req.body.product_id,
          quantity: req.body.quantity_sp,
          size: req.body.size_sp,
          price: price * req.body.quantity_sp,
        });
        await newListProduct.save();

        // cập nhật lại giỏ hàng
        const currentTotalQuanti = cart.total_quantity;
        let newTotalQuanti = currentTotalQuanti + 1;
        const currentTotalPrice = cart.total_price;
        let newTotalPrice = currentTotalPrice + req.body.quantity_sp * price;

        cart = await Cart.findOneAndUpdate(
          { _id: user.cart_id._id },
          {
            $push: { list_product: newListProduct._id },
            $set: {
              total_quantity: newTotalQuanti,
              total_price: newTotalPrice,
            },
          },
          { new: true }
        );
      } else {
        console.log("có");
        // cập nhật lại số lượng sản phẩm
        const updateListProduct = await ListProduct.findOneAndUpdate(
          {
            cart_id: cart._id,
            product_id: req.body.product_id,
          },
          {
            $inc: {
              quantity: req.body.quantity_sp,
              price: req.body.quantity_sp * price,
            },
          },
          { new: true }
        );

        // cập nhật lại giỏ hàng
        const currentTotalPrice = cart.total_price;
        let newTotalPrice = currentTotalPrice + req.body.quantity_sp * price;

        cart = await Cart.findOneAndUpdate(
          { _id: user.cart_id._id },
          {
            $set: {
              total_price: newTotalPrice,
            },
          },
          { new: true }
        );
      }

      console.log("cart1", cart);

      console.log("sut thanh cong");
      console.timeEnd("myTimer");
      res.status(200).json({ cart: cart, message: "addcart-success" });
      // res.status(200).json("getCart");
    } catch (err) {
      console.log("failer");
      res.status(500).json(err);
    }
  },

  //  Cập nhật giỏ hàng
  updateCart: async (req, res) => {
    // try {
    //   const getQuanti = await ListProduct.findOne({
    //     _id: req.params.id,
    //   }).populate({
    //     path: "product_id",
    //     populate: { path: "discountProduct_id" },
    //   });

    //   const getCart = await Cart.findOne({ _id: getQuanti.cart_id }).lean();
    //   let currentTotalPrice = getCart.total_price;

    //   // lấy tiền của sản phẩm update
    //   let price = getQuanti.product_id.price;
    //   if (getQuanti.product_id.discountProduct_id.discount_amount > 0) {
    //     price =
    //       getQuanti.product_id.price *
    //       (1 -
    //         Number(getQuanti.product_id.discountProduct_id.discount_amount) /
    //           100);
    //   } else {
    //     price = getQuanti.product_id.price;
    //   }

    //   let currentQuanti = getQuanti.quantity;
    //   let currentPrice = getQuanti.price;

    //   if (req.body.condition == "add") {
    //     currentQuanti += 1;
    //     currentPrice = price * currentQuanti;
    //     currentTotalPrice += price;
    //     console.log("cộng");
    //   } else if (req.body.condition == "minus") {
    //     currentQuanti -= 1;
    //     currentPrice = price * currentQuanti;
    //     currentTotalPrice -= price;
    //     console.log("trừ");
    //   }

    //   const updatedCart = await ListProduct.updateOne(
    //     { _id: req.params.id },
    //     {
    //       $set: { quantity: currentQuanti, price: currentPrice },
    //     },
    //     { new: true }
    //   );

    //   await Cart.updateOne(
    //     { _id: getQuanti.cart_id },
    //     {
    //       $set: { total_price: currentTotalPrice },
    //     },
    //     { new: true }
    //   );

    try {
      const getQuanti = await ListProduct.findOne({
        _id: req.params.id,
      }).populate({
        path: "product_id",
        populate: { path: "discountProduct_id" },
      });

      // console.log("getQuanti", getQuanti);

      let { quantity: currentQuanti } = getQuanti;
      const { product_id } = getQuanti;
      let { price: currentPrice } = getQuanti;

      // console.log("{----}", currentQuanti, product_id, currentPrice);

      // Get the price of the product based on discount
      let price =
        product_id.discountProduct_id.discount_amount > 0
          ? product_id.price *
            (1 - Number(product_id.discountProduct_id.discount_amount) / 100)
          : product_id.price;

      // console.log("price", price);

      req.body.condition == "add" ? (currentQuanti += 1) : (currentQuanti -= 1);
      currentPrice = price * currentQuanti;

      // console.log("currentPrice", currentPrice);

      await ListProduct.updateOne(
        { _id: req.params.id },
        {
          $set: {
            quantity: currentQuanti,
            price: currentPrice,
          },
        }
      );

      const getCart = await Cart.findOne({ _id: getQuanti.cart_id });
      let { total_price: currentTotalPrice } = getCart;
      currentTotalPrice += price * (req.body.condition == "add" ? 1 : -1);

      getCart.total_price = currentTotalPrice;
      await getCart.save();

      // console.log("getCart", getCart);

      // res.status(200).json(updatedCart);
      res.status(200).json("Cập nhật thành công");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Xoá sản phẩm trong giỏ hàng
  deleteProductInCart: async (req, res) => {
    try {
      const getProduct = await ListProduct.findById(req.params.id).lean();
      const cart_id = getProduct.cart_id;

      const update = {
        $pull: { list_product: req.params.id },
        $inc: { total_price: -getProduct.price, total_quantity: -1 },
      };
      const options = { new: true }; // Trả về giỏ hàng được cập nhật sau khi thay đổi

      const updatedCart = await Cart.findOneAndUpdate(
        { _id: cart_id },
        update,
        options
      ).populate("list_product");

      await ListProduct.deleteOne({ _id: req.params.id });

      // Lấy thông tin sản phẩm cần xoá
      // const getProduct = await ListProduct.findOne({
      //   _id: req.params.id,
      // }).lean();

      // // Cập nhật giỏ hàng bằng cách xoá sản phẩm ra khỏi danh sách sản phẩm
      // const updatedCart = await Cart.findOneAndUpdate(
      //   { _id: getProduct.cart_id },
      //   { $pull: { list_product: req.params.id } },
      //   { new: true }
      // ).populate({ path: "list_product", model: "ListProduct" });

      // // xoá ListProduct với _id là req.params.id
      // await ListProduct.deleteOne({ _id: req.params.id });

      console.log("thanhf cong");
      // res.status(200).json(updatedCart);
      res.status(200).json("Cart has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy ra 1 giỏ hàng
  getUserCart: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id }).populate(
        "cart_id"
      );

      const total_price = user.cart_id.total_price;
      const total_quanti = user.cart_id.total_quantity;

      // const getCart = await ListProduct.find({
      //   cart_id: user.cart_id._id,
      // }).populate({
      //   path: "product_id",
      //   populate: { path: "discountProduct_id" },
      // });

      const getCart1 = await ListProduct.find({
        cart_id: user.cart_id._id,
      })
        .populate({
          path: "product_id",
          populate: { path: "discountProduct_id" },
        })
        .select("cart_id product_id quantity price size");

      // console.log("getCart1", getCart1[0].product_id.discountProduct_id);

      // const product = await Product.findById(req.params.id)
      // .populate("discountProduct_id", "discount_amount")
      // .populate("sizes", "size inStock")
      // .select(
      //   "title img categories color price discountProduct_id sizes setImg"
      // );

      const getallcart = {
        pricecart: total_price,
        product: getCart1,
        quanticart: total_quanti,
      };

      res.status(200).json(getallcart);
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  //  Lấy ra tất cả sản phẩm
  getAllCart: async (req, res) => {
    try {
      const carts = await Cart.find().lean();
      res.status(200).json(carts);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = cartController;
