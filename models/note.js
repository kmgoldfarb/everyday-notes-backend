const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
  date: { type: Date, required: true },
  action: { type: String },
  gratitude: { type: String },
  journal: { type: String, required: true },
  mood: { type: String, required: true },
  image: { type: String },
  creator: { type: String, required: true, ref: 'User' },
});

module.exports = mongoose.model('Note', noteSchema);
