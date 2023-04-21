// const middlewareController = require("../controllers/MiddlewareController");
const userController = require("../controllers/UserController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

//UPDATE
router.put(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  userController.updateUser
);

//DELETE
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAuthorization,
  userController.deleteUser
);

// Admin ----------------------------------------------------------------

//GET USER
router.get(
  "/find/:id",
  middlewareController.verifyTokenAndAdmin,
  userController.getOneUser
);

router.get(
  "/check-user/:id",
  middlewareController.verifyTokenAndAdmin,
  userController.checkUser
);

//GET ALL USER
router.get(
  "/",
  middlewareController.verifyTokenAndAdmin,
  userController.getAllUser
);

//GET USER STATS
router.get(
  "/stats",
  middlewareController.verifyTokenAndAdmin,
  userController.userStats
);

// lấy các user có số đơn hàng nhiều nhất ra
router.get(
  "/find-user-high-order",
  middlewareController.verifyTokenAndAdmin,
  userController.getUserHighOrder
);

// lấy các user hay huỷ đơn đơn hàng
router.get(
  "/find-users-canceled",
  middlewareController.verifyTokenAndAdmin,
  userController.getUserCanceledOrder
);

module.exports = router;

// //UPDATE
// router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
//   // if (req.body.password) {
//   //   const salt = bcrypt.genSaltSync(10);
//   //   const hash = bcrypt.hashSync(req.body.password, salt);
//   // }
//   // const t = req.body.phone

//   // console.log(req.body);
//   // for (let i = 0; i < t.length; i++) {
//   //   if(t[0] === 0) {

//   //   }
//   // }

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           username: req.body.username,
//           email: req.body.email,
//           phone: req.body.phone,
//           address: req.body.address,
//           genders: req.body.genders,
//           img: req.body.img,
//           fullname: req.body.fullname,
//         },
//       },
//       { new: true }
//     );

//     res.status(200).json({ updatedUser, token: req.body.token });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //DELETE
// router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json("User has been deleted...");
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // Admin ----------------------------------------------------------------

// //GET USER
// router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, ...others } = user._doc;
//     res.status(200).json(others);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// router.get("/check-user/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const user = await User.findOne({ _id: req.params.id }).lean();
//     if (!user) {
//       return res.status(200).json({ message: "Người dùng không tồn tại." });
//     }
//     res.status(200).json({ message: "Thành công." });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //GET ALL USER
// router.get("/", verifyTokenAndAdmin, async (req, res) => {
//   const query = req.query.new;
//   try {
//     const users = query
//       ? await User.find().sort({ _id: -1 }).limit(5)
//       : await User.find({ isAdmin: false });
//     res.status(200).json(users);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// //GET USER STATS
// router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
//   const date = new Date();
//   const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

//   try {
//     const data = await User.aggregate([
//       { $match: { createdAt: { $gte: lastYear } } },
//       {
//         $project: {
//           month: { $month: "$createdAt" },
//         },
//       },
//       {
//         $group: {
//           _id: "$month",
//           total: { $sum: 1 },
//         },
//       },
//     ]);
//     res.status(200).json(data);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // lấy các user có số đơn hàng nhiều nhất ra
// router.get("/find-user-high-order", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const highUserOrder = await User.find()
//       .sort({
//         firstTimeBuy: -1,
//       })
//       .select("_id firstTimeBuy username email img")
//       .limit(5);

//     res.status(200).json(highUserOrder);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });

// // lấy các user hay huỷ đơn đơn hàng
// router.get("/find-users-canceled", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const userCancelOrder = await User.find()
//       .sort({
//         canceledOrder: -1,
//       })
//       .select("_id canceledOrder username email img")
//       .limit(5);

//     // let listUser = [];
//     // for (let i = 0; i < highUserOrder.length; i++) {
//     //   const getUser = await User.findOne({
//     //     _id: mongoose.Types.ObjectId(highUserOrder[i].userId),
//     //   })
//     //     .select("username email img")
//     //     .lean();

//     //   let info = {
//     //     getUser: getUser,
//     //     infoOder: highUserOrder[i],
//     //   };
//     //   listUser.push(info);
//     // }
//     res.status(200).json(userCancelOrder);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });
