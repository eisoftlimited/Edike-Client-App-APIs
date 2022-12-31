require("dotenv").config();
require("express-async-errors");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const express = require("express");
const listEndPoints = require("list_end_points");
const connectDatabase = require("./config/edikeDb");
const rimraf = require("rimraf");
const fs = require("fs");
const uploadsDirectory = __dirname + "/uploads";
const path = require("path");

const app = express();
const notFound = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send("Edike Loan App");
});

const authRouters = require("./routes/auth");
const beneficiaryRouters = require("./routes/beneficiary");
const cardRouters = require("./routes/card");
const loanRouters = require("./routes/loan");
const transactionRouter = require("./routes/transaction");

app.use("/edike/api/v1/auth", authRouters);
app.use("/edike/api/v1/beneficiary", beneficiaryRouters);
app.use("/edike/api/v1/card", cardRouters);
app.use("/edike/api/v1/loan", loanRouters);
app.use("/edike/api/v1/paystack", transactionRouter);

app.use(notFound);
app.use(errorHandler);

fs.readdir(uploadsDirectory, function (err, files) {
  files.forEach(function (file, index) {
    fs.stat(path.join(uploadsDirectory, file), function (err, stat) {
      var endTime, now;
      if (err) {
        return console.error(err);
      }

      now = new Date().getTime();
      endTime = new Date(stat.ctime).getTime() + 7200000;

      if (now > endTime) {
        return rimraf(path.join(uploadsDirectory, file), function (err) {
          if (err) {
            return console.error(err);
          }
          console.log("upload removed");
        });
      }
    });
  });
});

const PORT = process.env.PORT;

listEndPoints(app);
const start = async () => {
  try {
    await connectDatabase(process.env.MONGODBURL_TEST);
    app.listen(PORT, () => console.log(`Server Listening at Port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
