const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
 title: 'string',
 content: 'string'
 timestamp: '',
*/
const post = mongoose.model(
  "Post",
  new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.reference.id, required: true },
  }, {
    timestamps: true
  })
);

module.exports = post;