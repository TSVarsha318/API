const express = require("express");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware for authentication
const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Deposit Money
router.post("/deposit", auth, async (req, res) => {
  const { amount } = req.body;
  const account = await Account.findOne({ userId: req.user.userId });

  account.balance += amount;
  await account.save();

  const transaction = new Transaction({ accountId: account._id, amount, type: "credit" });
  await transaction.save();

  res.json({ message: "Deposit Successful", balance: account.balance });
});

// Withdraw Money
router.post("/withdraw", auth, async (req, res) => {
  const { amount } = req.body;
  const account = await Account.findOne({ userId: req.user.userId });

  if (account.balance < amount) {
    return res.status(400).json({ message: "Insufficient funds" });
  }

  account.balance -= amount;
  await account.save();

  const transaction = new Transaction({ accountId: account._id, amount, type: "debit" });
  await transaction.save();

  res.json({ message: "Withdrawal Successful", balance: account.balance });
});

module.exports = router;
