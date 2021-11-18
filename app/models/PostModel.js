const mongoose = require("mongoose");

// this is our post schema....
const postSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  likeCount: {
    default: 0,
    type: Number,
  },
  commentCount: {
    default: 0,
    type: Number,
  },
  caption: {
    type: String,
  },
  hashTags: {
    type: [String],
  },
  type: {
    type: Number,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
});

//model for our postschema...
const post = new mongoose.model("post", postSchema);

module.exports = post;
