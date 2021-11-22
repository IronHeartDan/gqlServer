const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const ObjectId = Schema.Types.ObjectId;
const { ObjectId } = require("mongodb");

// this is our post schema....
const postSchema = new Schema({
  userId: {
    type: ObjectId,
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
    default: null,
    type: String,
  },
  hashTags: {
    default: null,
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
