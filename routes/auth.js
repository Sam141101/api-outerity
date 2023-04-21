const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { verifyTokenAndAuthorization, verifyToken } = require("./verifyToken");
const Cart = require("../models/Cart");
const ListProduct = require("../models/ListProduct");
const Token = require("../models/Token");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const authController = require("../controllers/authController");
// const middlewareController = require("../controllers/MiddlewareController");
const middlewareController = require("../controllers/middlewareController");
// const middlewareController = require("../controllers/middlewareController");
// const authController = require("../controllers/AuthController");
// const middlewareController = require("../controllers/MiddlewareController");

let refreshTokens = [];

// Dùng phương thức token authentication

// Áp dụng cái mô hình MVC

// ---------------------- Xác thực gmail để đăng kí ----------------
router.post("/confirm/register", authController.confirmRegisterUser);

router.get("/:id/verify/:token/", authController.verifyLink);
// ----------------------------------------------------------------

//REGISTER
router.post("/register", authController.register);

// ------------ Quên mật khẩu -----------------------
router.post("/forgot-password", authController.forgotPassword);

router.get(
  "/reset-password/:id/:token/",
  authController.verifyLinkResetPassword
);

router.post("/new-password", authController.newPassword);

// ----------------------------------------------------------------

//LOGIN
router.post("/login", authController.login);

// REFRESH
router.post(
  "/refresh/:id",
  // middlewareController.verifyTokenAndAuthorization,
  authController.refreshToken
);

// LOG OUT
router.post("/logout", middlewareController.verifyToken, authController.logout);

router.post(
  "/change-password/:id",
  middlewareController.verifyTokenAndAuthorization,
  authController.changePassword
);
module.exports = router;

// router.post("/confirm/register", async (req, res) => {
//   try {
//     console.log(req.body);
//     // kiểm tra xem gmail đã tồn tại hay chưa
//     let user = await User.findOne({ email: req.body.email });
//     console.log(user);
//     if (user)
//       return res
//         .status(409)
//         .send({ message: "User with given email already Exist!" });

//     const newUser = new User({
//       email: req.body.email,
//     });

//     console.log(">>> newUser", newUser);

//     const savedUser = await newUser.save();

//     console.log(">>> saved: ", savedUser);

//     const token = await new Token({
//       userId: savedUser._id,
//       token: crypto.randomBytes(32).toString("hex"),
//     }).save();

//     console.log(token);

//     const url = `${process.env.BASE_URL}auth/${savedUser._id}/verify/${token.token}`;

//     await sendEmail(savedUser.email, "Verify Email", url);

//     res.status(201).send({
//       message: "Một Email gửi đến tài khoản của bạn xin vui lòng xác minh",
//     });
//   } catch (err) {
//     res.status(500).send({ message: "Internal Server Error" });
//     console.log(err);
//   }
// });

// router.get("/:id/verify/:token/", async (req, res) => {
//   try {
//     console.log(req.params);
//     const user = await User.findOne({ _id: req.params.id });
//     if (!user) return res.status(400).send({ message: "Invalid link" });

//     const token = await Token.findOne({
//       userId: user._id,
//       token: req.params.token,
//     });
//     if (!token) return res.status(400).send({ message: "Invalid link" });

//     await User.updateOne({ _id: user._id }, { verified: true });
//     await token.remove();

//     // res.status(200).send({ message: "Email verified successfully" });
//     res.status(200).json({ id: user._id });
//   } catch (error) {
//     res.status(500).send({ message: "Internal Server Error" });
//     console.log(error);
//   }
// });

// // ----------------------------------------------------------------

// //REGISTER
// router.post("/register", async (req, res) => {
//   try {
//     const userCart = new Cart({
//       // list_product: listProduct._id,
//     });
//     const savedUserCart = await userCart.save();

//     const salt = bcrypt.genSaltSync(10);
//     const hash = bcrypt.hashSync(req.body.password, salt);

//     console.log(req.body);

//     // const findUser = await User.findOne({ _id: req.body.userid });
//     // console.log(findUser);
//     const updateUser = await User.updateOne(
//       { _id: req.body.userid },
//       {
//         $set: {
//           username: req.body.username,
//           password: hash,
//           cart_id: userCart._id,
//           img: "https://static2.yan.vn/YanNews/2167221/202102/facebook-cap-nhat-avatar-doi-voi-tai-khoan-khong-su-dung-anh-dai-dien-e4abd14d.jpg",
//         },
//       },
//       { new: true }
//     );

//     // const savedUser = await updateUser.save();
//     res.status(201).json(updateUser);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// });

// // ------------ Quên mật khẩu -----------------------
// router.post("/forgot-password", async (req, res) => {
//   try {
//     // kiểm tra xem gmail đã tồn tại hay chưa
//     let user = await User.findOne({ email: req.body.email });
//     if (!user) return res.status(409).send({ message: "User not Exist!" });

//     const secret = process.env.JWT_SEC + user.password;
//     const token = jwt.sign({ email: user.email, id: user._id }, secret, {
//       expiresIn: "5m",
//     });

//     const link = `${process.env.BASE_URL}reset-password/${user._id}/${token}`;
//     // const link = `http://localhost:3000reset-password/${user._id}/${token}`;

//     console.log(link);

//     await sendEmail(user.email, "Forgot Password", link);

//     res.status(201).send({
//       message: "Một Email gửi đến tài khoản của bạn xin vui lòng xác minh",
//     });
//   } catch (err) {
//     res.status(500).send({ message: "Internal Server Error" });
//     console.log(err);
//   }
// });

// router.get("/reset-password/:id/:token/", async (req, res) => {
//   const { id, token } = req.params;
//   const user = await User.findOne({ _id: id });
//   if (!user) return res.status(400).send({ message: "User not exists" });

//   const secret = process.env.JWT_SEC + user.password;
//   try {
//     const verify = jwt.verify(token, secret);

//     res.status(200).json({ email: verify.email, id: user._id });
//   } catch (error) {
//     res.status(500).send("Not verify");
//     console.log(error);
//   }
// });

// router.post("/new-password", async (req, res) => {
//   const user = await User.findOne({ _id: req.body.id });
//   if (!user) return res.status(400).send({ message: "User not exists" });

//   // const secret = process.env.JWT_SEC + user.password;
//   try {
//     // const verify = jwt.verify(req.body.token, secret);

//     const salt = bcrypt.genSaltSync(10);
//     // const encryptedPassword = await bcrypt.hash(password, salt);
//     const hash = bcrypt.hashSync(req.body.password, salt);

//     await User.updateOne(
//       {
//         _id: user._id,
//       },
//       {
//         $set: {
//           password: hash,
//         },
//       }
//     );

//     res.status(200).send({ message: "Update success" });
//   } catch (error) {
//     res.status(500).send({ message: "Fail" });
//     console.log(error);
//   }
// });

// // ----------------------------------------------------------------

// // GENERATE ACCESS TOKEN
// const generateAccessToken = (user) => {
//   return jwt.sign(
//     { id: user._id, isAdmin: user.isAdmin },
//     process.env.JWT_SEC,
//     {
//       expiresIn: "365d",
//     }
//   );
// };

// // GENERATE REFRESH TOKEN
// const generateRefreshToken = (user) => {
//   return jwt.sign(
//     { id: user._id, isAdmin: user.isAdmin },
//     process.env.RF_JWT_SEC,
//     { expiresIn: "365d" }
//   );
// };

// //LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.body.username });
//     if (!user) return res.status(404).json("User not found!");

//     const isPasswordCorrect = await bcrypt.compare(
//       req.body.password,
//       user.password
//     );
//     if (!isPasswordCorrect)
//       return res.status(400).json("Wrong password or username!");

//     const token = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);
//     refreshTokens.push(refreshToken);
//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: false,
//       path: "/",
//       sameSite: "strict",
//       withCredentials: true,
//     });

//     const { img, password, isAdmin, ...otherDetails } = user._doc;
//     res.status(200).json({ ...otherDetails, isAdmin, img, token });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // REFRESH
// router.post("/refresh", async (req, res) => {
//   // Lay token tu user
//   const refreshToken = req.cookies.refreshToken;
//   if (!refreshToken) return res.status(401).json("You are not authenticated!");
//   if (!refreshTokens.includes(refreshToken))
//     return res.status(401).json("Refresh token is not valid");
//   jwt.verify(refreshToken, process.env.RF_JWT_SEC, (err, user) => {
//     if (err) {
//       res.status(500).json(err);
//     }

//     refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

//     // Tao new accessToken va refreshToken
//     const newAccessToken = generateAccessToken(user);
//     const newRefreshToken = generateRefreshToken(user);
//     refreshTokens.push(newRefreshToken);
//     res.cookie("refreshToken", newRefreshToken, {
//       httpOnly: true,
//       secure: false,
//       path: "/",
//       sameSite: "strict",
//     });

//     res.status(200).json({ token: newAccessToken });
//   });
// });

// // LOG OUT

// // router.post("/logout", verifyTokenAndAuthorization, async (req, res) => {
// // router.post("/logout/:id", verifyTokenAndAuthorization, async (req, res) => {
// router.post("/logout", verifyToken, async (req, res) => {
//   res.clearCookie("refreshToken");
//   refreshTokens = refreshTokens.filter(
//     (token) => token !== req.cookies.refreshToken
//   );
//   res.status(200).json("Logged Out");
// });

// // router.post("/logout/:id", verifyTokenAndAuthorization, async (req, res) => {

// //   res.clearCookie("refreshToken");
// //   refreshTokens = refreshTokens.filter(
// //     (token) => token !== req.cookies.refreshToken
// //   );
// //   res.status(200).json("Logged Out");
// // });

// router.post(
//   "/change-password/:id",
//   verifyTokenAndAuthorization,
//   async (req, res) => {
//     try {
//       const user = await User.findOne({ _id: req.params.id });
//       if (!user) return res.status(404).send({ message: "User not found!" });

//       const isPasswordCorrect = await bcrypt.compare(
//         req.body.currentPassword,
//         user.password
//       );
//       if (!isPasswordCorrect)
//         return res.status(400).json("Wrong password or username!");

//       const salt = bcrypt.genSaltSync(10);
//       const hash = bcrypt.hashSync(req.body.newPassword, salt);

//       await User.updateOne(
//         {
//           _id: user._id,
//         },
//         {
//           $set: {
//             password: hash,
//           },
//         }
//       );

//       res.status(200).send({ message: "Update success" });
//     } catch (error) {
//       res.status(500).send({ message: "Fail" });
//       console.log(error);
//     }
//   }
// );
