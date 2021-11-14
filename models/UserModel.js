const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  userPhone: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  profilepicture: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
  },
  visibility: {
    type: Number,
    default: 0,
  },
  deviceToken: {
    type: [],
  },
  postCount: {
    type: Number,
    default: 0,
  },
  followerCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
});

const user = new mongoose.model("user", userSchema);

module.exports = user;
