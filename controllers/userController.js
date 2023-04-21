const User = require("../models/User");

const userController = {
  // Client ----------------------------------------------------------------

  // Cập nhật Người dùng
  updateUser: async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            // address: req.body.address,
            genders: req.body.genders,
            img: req.body.img,
            fullname: req.body.fullname,
          },
        },
        { new: true }
      );
      res.status(200).json({ updatedUser, token: req.body.token });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Xoá Người dùng
  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Admin ----------------------------------------------------------------

  // Lấy 1 người dùng ra theo id
  getOneUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const { password, ...others } = user._doc;
      res.status(200).json(others);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Kiểm tra có tồn tại người dùng này không
  checkUser: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id }).lean();
      if (!user) {
        return res.status(200).json({ message: "Người dùng không tồn tại." });
      }
      res.status(200).json({ message: "Thành công." });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Lấy ra tất cả user
  getAllUser: async (req, res) => {
    const query = req.query.new;
    try {
      const users = query
        ? await User.find().sort({ _id: -1 }).limit(5)
        : await User.find({ isAdmin: false });
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  //  Thống kê người dùng
  userStats: async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
      const data = await User.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Lấy các user có số đơn hàng nhiều nhất
  getUserHighOrder: async (req, res) => {
    try {
      const highUserOrder = await User.find()
        .sort({
          firstTimeBuy: -1,
        })
        .select("_id firstTimeBuy username email img")
        .limit(5);

      res.status(200).json(highUserOrder);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  //   Lấy các user hay huỷ đơn đơn hàng
  getUserCanceledOrder: async (req, res) => {
    try {
      const userCancelOrder = await User.find()
        .sort({
          canceledOrder: -1,
        })
        .select("_id canceledOrder username email img")
        .limit(5);
      res.status(200).json(userCancelOrder);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },
};

module.exports = userController;
