const express = require("express");
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

// Create Account
router.post("/create", auth, async (req, res) => {
  const account = new Account({ userId: req.user.userId });
  await account.save();
  res.json(account);
});

// Get Account Details
router.get("/", auth, async (req, res) => {
  const account = await Account.findOne({ userId: req.user.userId });
  res.json(account);
});

module.exports = router;
