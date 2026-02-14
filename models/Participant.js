const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Participant', participantSchema);
