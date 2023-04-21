const User = require("../models/User");
const axios = require("axios");
const Product = require("../models/Product");
const Address = require("../models/Address");
const mongoose = require("mongoose");

const addressController = {
  // Tạo 1 địa chỉ
  createAddress: async (req, res) => {
    try {
      if (
        !req.params.id ||
        !req.body.provinceName ||
        !req.body.districtName ||
        !req.body.wardName ||
        req.body.provinceId === 0 ||
        req.body.districtId === 0 ||
        req.body.wardId === 0 ||
        !req.body.address
      ) {
        return res
          .status(200)
          .json({ message: "Vui lòng xem lại thông tin vừa nhập." });
      }

      const addAddress = new Address({
        user_id: req.params.id,
        province: req.body.provinceName,
        district: req.body.districtName,
        ward: req.body.wardName,
        province_id: req.body.provinceId,
        district_id: req.body.districtId,
        ward_id: req.body.wardId,
        address: req.body.address,
      });

      await addAddress.save();
      res.status(200).json({ message: "Thêm thành công địa chỉ!" });
    } catch (error) {
      res.status(500).json({ message: "Thêm không thành công" });
      console.error(error);
    }
  },

  // update 1 địa chỉ
  updateAddress: async (req, res) => {
    try {
      if (
        !req.params.id ||
        !req.body.provinceName ||
        !req.body.districtName ||
        !req.body.wardName ||
        req.body.provinceId === 0 ||
        req.body.districtId === 0 ||
        req.body.wardId === 0 ||
        !req.body.address
      ) {
        return res
          .status(200)
          .json({ message: "Vui lòng xem lại thông tin vừa nhập." });
      }
      const updateAddress = await Address.updateOne(
        {
          user_id: mongoose.Types.ObjectId(req.params.id),
        },
        {
          $set: {
            province: req.body.provinceName,
            district: req.body.districtName,
            ward: req.body.wardName,
            province_id: req.body.provinceId,
            district_id: req.body.districtId,
            ward_id: req.body.wardId,
            address: req.body.address,
          },
        },
        { new: true }
      );
      res.status(200).json({ message: "Cập nhật thành công địa chỉ!" });
    } catch (error) {
      res.status(500).json({ message: "Cập nhật không thành công" });
      console.error(error);
    }
  },

  // Lấy địa chỉ người dùng
  getUserAddress: async (req, res) => {
    try {
      const findUserAddress = await Address.findOne({
        user_id: mongoose.Types.ObjectId(req.params.id),
      })
        .select(
          "province district ward address province_id district_id ward_id"
        )
        .lean();

      // if (!findUserAddress) {
      //   res.status(200).json("Chưa có địa chỉ");
      // }

      // let find;
      // if (findUserAddress === null) {
      //   find = findUserAddress;
      // } else {
      //   find = findUserAddress[0];
      // }
      // console.log(findUserAddress);

      // res.status(200).json(find);
      res.status(200).json(findUserAddress);
    } catch (error) {
      res.status(500).json({ message: "Không tìm thấy địa chỉ." });
      console.error(error);
    }
  },
};

module.exports = addressController;
