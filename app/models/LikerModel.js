const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const likerSchema = new Schema({
  postId: {
    type: ObjectId,
    required: true,
  },
  who: {
    type: ObjectId,
    required: true,
  },
});

const liker = new mongoose.model("liker", likerSchema);

module.exports = liker;
