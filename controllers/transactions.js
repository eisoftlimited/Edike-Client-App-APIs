const User = require("../models/User");
const Transaction = require("../models/Transaction");
const request = require("request");

const listTransactions = async (req, res) => {
  const user = await User.find({ _id: req.user.id });
  if (!user) {
    return res.status(400).json({ msg: "Unverified User", status: "invalid" });
  }

  const transact = await Transaction.find({
    user_id: req.user.id,
  });

  const options = {
    method: "GET",
    url: "https://api.paystack.co/transaction",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_APP_KEY}`,
      "Content-type": "application/json",
    },
  };

  request(options, async function (error, body) {
    if (error) {
      return res
        .status(400)
        .json({ msg: `${error.message}`, status: "invalid" });
    }

    const response = JSON.parse(body.body);

    const mail = user.map((e) => {
      return e.email;
    });

    const final = response.data.filter((e) => {
      if (mail.toString() === e.customer.email) {
        return e;
      }
    });

    return res
      .status(200)
      .json({ ans: final, status: "valid", transaction: transact });
  });
};

module.exports = {
  listTransactions,
};
