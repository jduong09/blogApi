const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = mongoose.model(
  "User",
  new Schema({
    first_name: { type: String }
  })
);

module.exports = user;