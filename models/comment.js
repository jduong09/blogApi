const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = mongoose.model(
  'Comment',
  new Schema({
    content: { type: String, required: true },
    author: { type: String }
  })
);

module.exports = comment;