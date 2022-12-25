const mongoose = require("mongoose");

const User = mongoose.model(
  "users",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    status: {
      type: String, 
      enum: ['Pending', 'Active'],
      default: 'Pending'
    },
    verificationKey: { 
      type: String, 
      unique: true },
  })
);

module.exports = User;