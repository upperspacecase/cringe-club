const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  votes: { type: Number, default: 0 },
  intensity: { type: Number, default: 0, min: 0, max: 3 },
  effort: { type: Number, default: 0, min: 0, max: 3 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
