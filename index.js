const express = require("express");
const cors = require("cors");
const paypal = require("paypal-rest-sdk");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const searchRoute = require("./routes/search");
const commentRoute = require("./routes/comment");
// paypal
const paypalRoute = require("./routes/paypal");
// receive
const receiveRoute = require("./routes/receive");
const discountRoute = require("./routes/discountCode");

// giao hàng nhanh
const shippingRoute = require("./routes/shipping");

const addressRoute = require("./routes/address");

dotenv.config();

paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

const corsOptions = {
  origin: [
    "http://localhost:3000",
    process.env.PRODUCTION,
    "https://sell-vercel-admin.vercel.app",
    "https://page-user.vercel.app",
    "https://sell-client.vercel.app",
    // 'https://page-user-l666tznx0-sam141101.vercel.app/'
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// const corsOptions = {
//   origin: '*',
//   credentials: true,
//   optionSuccessStatus: 200
// }
// app.use(cors(corsOptions))

// app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/search", searchRoute);
app.use("/api/comments", commentRoute);
app.use("/api/discounts", discountRoute);
// receive
app.use("/api/receive", receiveRoute);

// paypal
app.use("/api/paypal", paypalRoute);

// giao hàng nhanh
app.use("/api/shippings", shippingRoute);

app.use("/api/address", addressRoute);

app.get("/", (req, res) => {
  res.send("This server is Connected");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running!");
});
