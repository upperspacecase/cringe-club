const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  participant: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: true },
  completedAt: { type: Date, default: Date.now }
});

completionSchema.index({ itemId: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model('Completion', completionSchema);
