const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
});

const user = new mongoose.model("user", userSchema);

module.exports = user;