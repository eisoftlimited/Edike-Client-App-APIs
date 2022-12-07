require("dotenv").config();
require("express-async-errors");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const express = require("express");
const fileUpload = require("express-fileupload");
const listEndPoints = require("list_end_points");
const connectDatabase = require("./config/edikeDb");

const app = express();

// Error Handlers
const notFound = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");

// INITIALIZING MIDDLEWARE
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// DEFINED ROUTES
app.get("/", (req, res) => {
  res.send("Edike Loan App");
});

const authRouters = require("./routes/auth");
const beneficiaryRouters = require("./routes/beneficiary");
// const orderRouters = require("./routes/order");
// const bicycleRouters = require("./routes/bicycle");

app.use("/edike/api/v1/auth", authRouters);
app.use("/edike/api/v1/beneficiary", beneficiaryRouters);
// app.use("/api/v1/order", orderRouters);
// app.use("/api/v1/waitlist", bicycleRouters);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 9191;
listEndPoints(app);
const start = async () => {
  try {
    await connectDatabase(process.env.MONGODBURL);
    app.listen(PORT, () => console.log(`Server Listening at Port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
