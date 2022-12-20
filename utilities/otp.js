const encode = require("node-base64-image").encode;

exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

exports.convertBase = async (url) => {
  const ans = `${url}`;
  const options = {
    string: true,
    headers: {
      "User-Agent": "my-app",
    },
  };
  const img = await encode(ans, options);
  return img;
};
