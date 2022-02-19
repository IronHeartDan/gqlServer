const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  _id: {
    type: String,
  },
  userEmail: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  userPhone: {
    type: String,
    trim: true,
    index: {
      unique: true,
      partialFilterExpression: { userPhone: { $type: "string" } },
    },
  },
  userName: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  profilepicture: {
    type: String,
    trim: true,
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
