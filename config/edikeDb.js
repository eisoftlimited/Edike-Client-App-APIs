const mongoose = require("mongoose");

const connectDatabase = async (url) => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
      // useUnifiedTopology: true,
    });
    console.log("mongodb connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
