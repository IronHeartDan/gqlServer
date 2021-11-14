const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const connectionSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  who: {
    type: String,
    required: true,
  },
});

const connection = new mongoose.model("connection", connectionSchema);

module.exports = connection;
