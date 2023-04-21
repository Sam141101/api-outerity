const User = require("../models/User");
const axios = require("axios");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const Address = require("../models/Address");

const shippingController = {
  // Lấy giá vận chuyển
  getServiceCharge: async (req, res) => {
    try {
      if (!req.body.service_id) {
        return res.status(200).json(0);
      }

      // Lấy mã Quận huyện của người gửi hàng
      const findShopAddress = await Address.findOne({
        user_id: mongoose.Types.ObjectId(process.env.ADMIN_ID),
      })
        .select("district_id")
        .lean();

      const districtIdShop = findShopAddress.district_id;

      const shopid = Number(process.env.SHOPID);

      const getPriceServiceGHN = await axios.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
        {
          from_district_id: districtIdShop,
          service_id: Number(req.body.service_id),
          service_type_id: null,
          to_district_id: Number(req.body.to_district_id),
          to_ward_code: Number(req.body.to_ward_code),
          height: 1 * Number(req.body.quantiProduct),
          length: 80,
          weight: 1500 * Number(req.body.quantiProduct),
          width: 30,
          insurance_value: 0,
          coupon: null,
        },
        {
          headers: {
            token: process.env.TOKEN,
            shopid: shopid,
            "Content-type": "application/json",
          },
        }
      );

      const priceService = getPriceServiceGHN.data;
      res.status(200).json(priceService);
    } catch (error) {
      console.error(error);
    }
  },

  // Lấy ra gói dịch vụ
  getServicePack: async (req, res) => {
    try {
      // Lấy mã Quận huyện của người nhận hàng
      const findUserAddress = await Address.findOne({
        user_id: mongoose.Types.ObjectId(req.params.id),
      })
        .select("district_id")
        .lean();

      // Kiểm tra xem có địa chỉ chưa
      if (findUserAddress === null) {
        return res.status(200).json({});
      }

      // Lấy mã Quận huyện của người gửi hàng
      const findShopAddress = await Address.findOne({
        user_id: mongoose.Types.ObjectId(process.env.ADMIN_ID),
      })
        .select("district_id")
        .lean();

      const districtIdShop = findShopAddress.district_id;

      const shopid = Number(process.env.SHOPID);

      const getServiceGHN = await axios.post(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services",
        {
          shop_id: shopid, // Mã định danh của cửa hàng
          from_district: districtIdShop, // mã Quận/Huyện của người gửi hàng.
          to_district: findUserAddress.district_id, // mã Quận/Huyện của người nhận hàng.
        },
        {
          headers: {
            token: process.env.TOKEN,
            "Content-type": "application/json",
          },
        }
      );

      const listService = getServiceGHN.data;
      console.log({
        listService: listService,
        districtId: districtIdShop,
      });
      res.status(200).json({
        listService: listService,
        districtId: districtIdShop,
      });
    } catch (error) {
      res.status(500).json("Không có dịch vụ nào phù hợp");
      console.error(error);
    }
  },

  // Danh sách tỉnh, thành
  getListProvince: async (req, res) => {
    try {
      // /API Lấy Danh sách Tỉnh Thành
      const getProvinceList = await axios.get(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
        {
          headers: {
            token: process.env.TOKEN,
            "Content-type": "application/json",
          },
        }
      );

      const dataProvince = getProvinceList.data;

      const InfoProvince = dataProvince.data.map((province) => ({
        ProvinceID: province.ProvinceID,
        ProvinceName: province.ProvinceName,
      }));
      // console.log(InfoProvince);
      res.status(200).json(InfoProvince);
    } catch (error) {
      res.status(500).json("Không tìm thấy tỉnh thành nào?");
      console.error(error);
    }
  },

  // Danh sách quận, huyện theo tỉnh, thành
  getListDistrict: async (req, res) => {
    try {
      // /API Lấy Danh sách Quận Huyện
      if (req.body.province_id === 0) {
        res.status(200).json("chưa điền tỉnh thành");
        return;
      }
      const getDistrictList = await axios.get(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
        {
          params: {
            province_id: req.body.province_id,
          },
          headers: {
            token: process.env.TOKEN,
            "Content-type": "application/json",
          },
        }
      );

      const dataDistrict = getDistrictList.data;

      const InfoDistrict = dataDistrict.data.map((province) => ({
        // ProvinceID: province.ProvinceID,
        DistrictID: province.DistrictID,
        DistrictName: province.DistrictName,
      }));
      // console.log(InfoDistrict);
      res.status(200).json(InfoDistrict);
    } catch (error) {
      res.status(500).json("Không tìm thấy quận huyện nào?");
      console.error(error);
    }
  },

  // Danh sách phường xã theo quận, huyện
  getListWard: async (req, res) => {
    try {
      // /API Lấy Danh sách Quận Huyện
      if (req.body.district_id === 0) {
        res.status(200).json("chưa điền quận huyện");
        return;
      }
      const getWardList = await axios.get(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        {
          params: {
            district_id: req.body.district_id,
          },
          headers: {
            token: process.env.TOKEN,
            "Content-type": "application/json",
          },
        }
      );

      const dataWard = getWardList.data;

      const InfoWard = dataWard.data.map((province) => ({
        // ProvinceID: province.ProvinceID,
        WardCode: province.WardCode,
        WardName: province.WardName,
      }));
      // console.log(InfoWard);
      res.status(200).json(InfoWard);
    } catch (error) {
      res.status(500).json("Không tìm thấy phường xã nào?");
      console.error(error);
    }
  },

  // Danh sách ca shipper lấy hàng
  getListDeliveryTime: async (req, res) => {
    try {
      const getList = await axios.get(
        "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shift/date",
        {
          headers: {
            token: process.env.TOKEN,
            // "Content-type": "application/json",
          },
        }
      );

      // console.log(getList.data);

      res.status(200).json(getList.data.data);
    } catch (error) {
      res.status(500).json("Không tìm thấy ca giao hàng nào?");
      console.error(error);
    }
  },
};

module.exports = shippingController;
