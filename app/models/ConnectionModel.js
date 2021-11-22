const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const connectionSchema = new Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  who: {
    type: ObjectId,
    required: true,
  },
});

const connection = new mongoose.model("connection", connectionSchema);

module.exports = connection;
