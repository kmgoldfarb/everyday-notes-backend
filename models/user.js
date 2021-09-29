const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    notes: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Note' }],
  },
  { collection: 'users' }
);

module.exports = mongoose.model('User', userSchema);
