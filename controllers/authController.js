const router = require("express").Router();
const User = require("../models/User");
const Token = require("../models/Token");
// const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// const {
//   verifyTokenAndAuthorization,
//   verifyToken,
// } = require("../routes/verifyToken");
const Cart = require("../models/Cart");
// const ListProduct = require("../models/ListProduct");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");
// const Shipping = require("../models/Shipping");

// let refreshTokens = [];

const generateAccessToken = (user) => {
  // console.log("input", user);
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SEC,
    {
      expiresIn: "3600s",
      // expiresIn: "20s",
    }
  );
};

// GENERATE REFRESH TOKEN
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.RF_JWT_SEC,
    { expiresIn: "365d" }
  );
};

const authController = {
  // Xác thực người dùng để đăng kí bằng cách
  // gửi gmail đến gmail người dùng chọn để đăng kí
  confirmRegisterUser: async (req, res) => {
    try {
      // kiểm tra xem gmail đã tồn tại hay chưa
      let user = await User.findOne({ email: req.body.email }).lean();
      console.log(user);
      if (user) return res.status(409).send({ message: "Email đã tồn tại!" });

      const newUser = new User({
        email: req.body.email,
      });

      console.log(">>> newUser", newUser);
      const savedUser = await newUser.save();

      const token = await new Token({
        userId: savedUser._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();

      console.log(token);
      const url = `${process.env.BASE_URL}auth/${savedUser._id}/verify/${token.token}`;

      await sendEmail(savedUser.email, "Verify Email", url);

      res.status(201).send({
        message: "Một Email gửi đến tài khoản của bạn xin vui lòng xác minh",
      });
    } catch (err) {
      res.status(500).send({ message: "Lỗi máy chủ" });
      console.log(err);
    }
  },

  //   Xác nhận đường link gửi trong gmail ---> trang đăng kí
  verifyLink: async (req, res) => {
    try {
      console.log(req.params);
      const user = await User.findOne({ _id: req.params.id }).lean();
      if (!user)
        return res.status(400).send({ message: "Liên kết không hợp lệ" });

      const token = await Token.findOne({
        userId: user._id,
        token: req.params.token,
      }).lean();
      if (!token)
        return res.status(400).send({ message: "Liên kết không hợp lệ" });

      await User.updateOne({ _id: user._id }, { verified: true });
      await token.remove();

      // res.status(200).send({ message: "Email verified successfully" });
      res.status(200).json({ id: user._id });
    } catch (error) {
      res.status(500).send({ message: "Lỗi máy chủ" });
      console.log(error);
    }
  },

  //   Đăng kí
  register: async (req, res) => {
    try {
      // khi xác thực thành công
      const userCart = new Cart({});
      const savedUserCart = await userCart.save();

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.inputs.password, salt);
      const updateUser = await User.updateOne(
        { _id: req.body.userid },
        {
          $set: {
            username: req.body.inputs.username,
            password: hash,
            cart_id: userCart._id,
            img: "https://static2.yan.vn/YanNews/2167221/202102/facebook-cap-nhat-avatar-doi-voi-tai-khoan-khong-su-dung-anh-dai-dien-e4abd14d.jpg",
          },
        },
        { new: true }
      );

      // res.status(201).json(updateUser);
      res.status(201).json("Đăng ký tài khoản thành công.");
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  //  Người dùng quên mật khẩu
  forgotPassword: async (req, res) => {
    try {
      // kiểm tra xem gmail đã tồn tại hay chưa
      let user = await User.findOne({ email: req.body.email }).lean();
      if (!user) return res.status(409).send({ message: "User not Exist!" });

      const secret = process.env.JWT_SEC + user.password;
      const token = jwt.sign({ email: user.email, id: user._id }, secret, {
        expiresIn: "5m",
      });

      const link = `${process.env.BASE_URL}reset-password/${user._id}/${token}`;
      await sendEmail(user.email, "Forgot Password", link);

      res.status(201).send({
        message: "Một Email gửi đến tài khoản của bạn xin vui lòng xác minh",
      });
    } catch (err) {
      res.status(500).send({ message: "Internal Server Error" });
      console.log(err);
    }
  },

  //   Xác thực đường link trong gmail
  // cho việc reset lại mật khẩu
  verifyLinkResetPassword: async (req, res) => {
    const { id, token } = req.params;
    const user = await User.findOne({ _id: id }).lean();
    if (!user) return res.status(400).send({ message: "User not exists" });

    const secret = process.env.JWT_SEC + user.password;
    try {
      const verify = jwt.verify(token, secret);

      res.status(200).json({ email: verify.email, id: user._id });
    } catch (error) {
      res.status(500).send("Not verify");
      console.log(error);
    }
  },

  //   Người dùng tạo mật khẩu mới
  newPassword: async (req, res) => {
    try {
      // const user = await User.findOne({ _id: req.body.id });
      // if (!user) return res.status(400).send({ message: "User not exists" });

      // const salt = bcrypt.genSaltSync(10);
      // // const encryptedPassword = await bcrypt.hash(password, salt);
      // const hash = bcrypt.hashSync(req.body.password, salt);
      // await User.updateOne(
      //   {
      //     _id: user._id,
      //   },
      //   {
      //     $set: {
      //       password: hash,
      //     },
      //   }
      // );

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: req.body.id,
        },
        {
          $set: {
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10)
            ),
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(400).send({ message: "User not exists" });
      }

      res.status(200).send({ message: "Password updated successfully" });

      // res.status(200).send({ message: "Update success" });
    } catch (error) {
      res.status(500).send({ message: "Fail" });
      console.log(error);
    }
  },

  //   Người dùng đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });
      if (!user) return res.status(404).send({ message: "User not found!" });

      const isPasswordCorrect = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isPasswordCorrect)
        return res.status(400).json("Wrong password or username!");

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.newPassword, salt);

      await User.updateOne(
        {
          _id: user._id,
        },
        {
          $set: {
            password: hash,
          },
        }
      );
      res.status(200).send({ message: "Update success" });
    } catch (error) {
      res.status(500).send({ message: "Fail" });
      console.log(error);
    }
  },

  //   Đăng nhập vào website
  login: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (!user) return res.status(404).json("Không tìm thấy người dùng!");

      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordCorrect)
        return res.status(400).json("Sai mật khẩu hoặc tài khoản!");

      const token = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      const findRefreshToken = await RefreshToken.findOne({ userId: user._id });
      if (!findRefreshToken) {
        const createRefreshToken = new RefreshToken({
          userId: user._id,
          refreshToken: refreshToken,
        });
        await createRefreshToken.save();
      } else {
        findRefreshToken.refreshToken = refreshToken;
        await findRefreshToken.save();
      }

      // const updateRefreshToken = await RefreshToken.updateOne(
      //   {
      //     _id: findRefreshToken._id,
      //   },
      //   {
      //     $set: {
      //       refreshToken: refreshToken,
      //     },
      //   },
      //   {
      //     new: true,
      //   }
      // );

      // res.cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   secure: false,
      //   path: "/",
      //   sameSite: "strict",
      //   withCredentials: true,
      // });

      const { img, password, isAdmin, ...otherDetails } = user._doc;
      res.status(200).json({ ...otherDetails, isAdmin, img, token });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  // //  tải lại token ( REFRESH )
  refreshToken: async (req, res) => {
    // const refreshToken = req.cookies.refreshToken;

    // console.log(req.params.id);
    const findRefreshTokenData = await RefreshToken.findOne({
      userId: mongoose.Types.ObjectId(req.params.id),
    }).lean();

    if (!findRefreshTokenData)
      return res.status(401).json("Refresh token is not valid");

    let refreshToken = findRefreshTokenData.refreshToken;

    jwt.verify(refreshToken, process.env.RF_JWT_SEC, async (err, user) => {
      if (err) {
        res.status(500).json(err);
      }

      // Tao new accessToken va
      const userFind = await User.findOne({
        _id: mongoose.Types.ObjectId(user.id),
      }).lean();

      const newAccessToken1 = generateAccessToken(userFind);
      const newRefreshToken = generateRefreshToken(userFind);

      await RefreshToken.updateOne(
        {
          // _id: findRefreshToken._id,
          _id: findRefreshTokenData._id,
        },
        {
          $set: {
            refreshToken: newRefreshToken,
          },
        },
        {
          new: true,
        }
      );

      res.status(200).json({ token: newAccessToken1 });
    });
  },

  //   Đăng xuất khỏi trang web
  logout: async (req, res) => {
    try {
      await RefreshToken.updateOne(
        { userId: req.body.userId },
        {
          $set: {
            refreshToken: null,
          },
        },
        {
          new: true,
        }
      );

      res.status(200).json("Logged Out");
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = authController;
