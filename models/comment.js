const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = mongoose.model(
  'Comment',
  new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'Author' },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true }
  })
);

module.exports = comment;