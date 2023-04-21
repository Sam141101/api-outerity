const DiscountCode = require("../models/DiscountCode");

const discountController = {
  // User ----------------------------------------------------

  // Lấy ra các mã mà người dùng có
  getDiscountUser: async (req, res) => {
    try {
      console.log(req.params.option);
      const currentCustomerId = req.params.id; // ID của khách hàng đang đăng nhập
      const option = req.params.option; // option lọc theo thời gian hết hạn mã giảm giá hoặc thời gian đưa ra
      const query = {
        $or: [
          { used_by: currentCustomerId }, // Mã giảm giá riêng của khách hàng
          { used_by: { $size: 0 } }, // Mã giảm giá chung (dành cho tất cả khách hàng)
        ],
      };

      if (option === "new") {
        query.expiration_date = { $gte: new Date() };
        // Thêm điều kiện lọc các mã giảm giá có thời gian hết hạn expiration_date sau thời điểm hiện tại
      } else if (option === "expire") {
        query.expiration_date = { $lt: new Date() };
        // Thêm điều kiện lọc các mã giảm giá có thời gian hết hạn expiration_date trước thời điểm hiện tại
      }

      // const listCoupons = await DiscountCode.find(query).lean();
      const listCoupons = await DiscountCode.find(query)
        .select(
          "coupon_code descCoupon discount_type discount_amount expiration_date maximum_uses minimum_purchase_amount"
        )
        .lean();
      res.status(200).json(listCoupons);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Khách hàng bấm sử dụng để check mã giảm giá
  checkDiscount: async (req, res) => {
    try {
      const currentCustomerId = req.params.id; // ID của khách hàng đang đăng nhập
      const totalPriceOrder = parseFloat(req.params.priceOrder);

      const discountCode = await DiscountCode.findOne({
        coupon_code: req.params.couponCode,
      }).lean();
      if (!discountCode) {
        return res
          .status(200)
          .json({ message: "Mã giảm giá không chính xác." });
      }

      const usedByIds = discountCode.used_by.map((id) => id.toString());
      // console.log(usedByIds);
      // console.log("userId", typeof currentCustomerId);
      // console.log(!usedByIds.includes(currentCustomerId));

      // Kiểm tra nếu mã giảm giá đã hết hạn
      if (
        discountCode.expiration_date &&
        new Date() > discountCode.expiration_date
      ) {
        return res.status(200).json({ message: "Mã giảm giá này đã hết hạn." });
      }

      // Kiểm tra nếu mã giảm giá đã hết số lượng sử dụng cho phép
      if (
        discountCode.maximum_uses &&
        discountCode.type_user === "people" &&
        discountCode.used_by.length >= discountCode.maximum_uses
      ) {
        return res.status(200).json({ message: "Hết mã giảm giảm giá." });
      }

      // Nếu có giá trị minimum_purchase_amount thì kiểm tra số tiền đơn hàng có đạt yêu cầu không
      if (
        discountCode.minimum_purchase_amount &&
        totalPriceOrder < discountCode.minimum_purchase_amount
      ) {
        return res
          .status(200)
          .json({ message: "Tổng số tiền đơn hàng chưa thoả mãn điều kiện." });
      }

      // Kiểm tra nếu loại mã giảm giá chỉ dành cho cá nhân và khách hàng không thể sử dụng
      if (
        discountCode.type_user === "person" &&
        !usedByIds.includes(currentCustomerId)
      ) {
        return res
          .status(200)
          .json({ message: "Không thể sử dụng mã giảm giá." });
      }

      // Kiểm tra nếu loại mã giảm giá chỉ dành cho cá nhân và mã giảm giá đã sử dụng trước đó
      if (
        discountCode.type_user === "person" &&
        discountCode.is_redeemed === true
      ) {
        return res
          .status(200)
          .json({ message: "Mã giảm giá này đã được sử dụng." });
      }

      // Kiểm tra nếu loại mã giảm giá dành cho nhiều người và khách hàng đã sử dụng trước đó
      if (
        discountCode.type_user === "people" &&
        usedByIds.includes(currentCustomerId)
      ) {
        return res
          .status(200)
          .json({ message: "Bạn đã sử dụng mã giảm giá này trước đó." });
      }

      const infoCoupon = {
        discount_type: discountCode.discount_type,
        discount_amount: discountCode.discount_amount,
        descCoupon: discountCode.descCoupon,
      };

      res
        .status(200)
        .json({ message: "Át mã giảm giá thành công.", infoCoupon });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Admin -----------------------------------

  // Admin xoá mã giảm giá
  deleteDiscount: async (req, res) => {
    try {
      await DiscountCode.findByIdAndDelete(req.params.id);
      res.status(200).json("Coupon has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy 1 mã giảm giá ra xem theo _id
  getDiscountId: async (req, res) => {
    try {
      const Discount = await DiscountCode.find({ _id: req.params.id }).populate(
        {
          path: "used_by",
        }
      );

      if (!Discount[0].expiration_date instanceof Date) {
        // Nếu tham số 'expiration_date' không phải là đối tượng Date, trả về 0
        return 0;
      }

      // Chuyển đổi expiration_date từ đối tượng Date sang thời gian Unix
      const expireTimeUnix = Discount[0].expiration_date.getTime();

      // Tính toán giá trị của expireAt
      const now = Date.now();
      const expireAt = Math.round((expireTimeUnix - now) / (60 * 60 * 1000));
      // Discount[0].expiration_date = expireAt;

      let discount = { ...Discount[0]._doc, expiration_date: expireAt };
      // const { img, password, isAdmin, ...otherDetails } = user._doc;

      res.status(200).json(discount);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Admin tạo mã giảm giá cho tất cả người dùng có thể sử dụng
  createPeopleUse: async (req, res) => {
    try {
      // const coupon_code = crypto.randomBytes(5).toString("hex");

      // req.body.expireAt số tiếng
      let expireTimeAt;
      if (req.body.expireAt === null) {
        expireTimeAt = null;
      } else {
        expireTimeAt = new Date(
          Date.now() + req.body.expireAt * 60 * 60 * 1000
        );
      }
      // const expireTimeAt = new Date(
      //   Date.now() + req.body.expireAt * 60 * 60 * 1000
      // );

      const discountCode = new DiscountCode({
        coupon_code: req.body.coupon_code,
        discount_type: req.body.discount_type,
        discount_amount: req.body.discount_amount,
        expiration_date: expireTimeAt,
        minimum_purchase_amount: req.body.minimum_purchase_amount,
        maximum_uses: req.body.maximum_uses,
        valid_for_categories: req.body.categories,
        is_single_use: req.body.is_single_use,
        is_redeemed: req.body.is_redeemed,
        descCoupon: req.body.descCoupon,
        type_user: req.body.type_user,
      });
      await discountCode.save();

      // res.status(200).json(discountCode);
      res.status(200).json("Tạo mã giảm giá thành công");
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  // Admin tạo mã giảm giá cho riêng 1 cá nhân
  createPersonUse: async (req, res) => {
    try {
      const usedId = req.params.id;
      // const coupon_code = crypto.randomBytes(5).toString("hex");

      // req.body.expireAt số tiếng
      let expireTimeAt;
      if (req.body.expireAt === null) {
        expireTimeAt = null;
      } else {
        expireTimeAt = new Date(
          Date.now() + req.body.expireAt * 60 * 60 * 1000
        );
      }

      const discountCode = new DiscountCode({
        coupon_code: coupon_code,
        discount_type: req.body.discount_type,
        discount_amount: req.body.discount_amount,
        expiration_date: expireTimeAt,
        minimum_purchase_amount: req.body.minimum_purchase_amount,
        maximum_uses: 1,
        valid_for_categories: req.body.categories,
        is_single_use: req.body.is_single_use,
        is_redeemed: req.body.is_redeemed,
        descCoupon: req.body.descCoupon,
        type_user: req.body.type_user,
      });

      discountCode.used_by.push(usedId);
      await discountCode.save();

      // res.status(200).json(discountCode)
      res.status(200).json("Tạo mã giảm giá thành công");
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  // Mã giảm giá cho riêng 1 cá nhân
  // sau khi mua món hàng đầu tiên của shop
  discountPurchasedOnce: async (req, res) => {
    try {
      const findUser = await User.findOne({ _id: req.body.user_id }).lean();

      await DiscountCode.updateOne(
        {
          descCoupon: req.params.id,
        },
        {
          $push: { used_by: findUser._id },
        },
        { new: true }
      );

      res.status(200).json("thêm mã giảm giá cho người dùng thành công");
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },

  // Admin sửa đổi thông tin mã giảm giá
  updateDiscount: async (req, res) => {
    try {
      let expireTimeAt;
      if (req.body.expireAt === null) {
        expireTimeAt = null;
      } else {
        expireTimeAt = new Date(
          Date.now() + parseFloat(req.body.expiration_date) * 60 * 60 * 1000
        );
      }

      let discount = { ...req.body, expiration_date: expireTimeAt };

      const updatedOrder = await DiscountCode.findByIdAndUpdate(
        req.params.id,
        {
          $set: discount,
        },
        { new: true }
      );
      // res.status(200).json(updatedOrder);
      res.status(200).json("Cập nhật thành công");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Admin check xem code đã tồn tại chưa
  checkCode: async (req, res) => {
    try {
      const code = await DiscountCode.findOne({
        coupon_code: req.params.id,
      }).lean();
      if (code) {
        return res.status(200).json({ message: "Mã code đã tồn tại." });
      }
      res.status(200).json({ message: "Chưa có code này có thể tạo mới." });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy ra discount theo từng select
  getDiscountSelect: async (req, res) => {
    try {
      const option = req.params.select;
      const query = {};

      if (option === "people") {
        query.type_user = "people";
      } else if (option === "person") {
        query.type_user = "person";
      } else if (option === "percentage") {
        query.discount_type = "percentage";
      } else if (option === "amount") {
        query.discount_type = "amount";
      }

      const listCoupons = await DiscountCode.find(query)

        .select(
          "_id coupon_code type_user descCoupon discount_type discount_amount expiration_date maximum_uses minimum_purchase_amount"
        )
        .lean();

      res.status(200).json(listCoupons);
      // res.status(200).json("scuccé");
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = discountController;
