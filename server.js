require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const Item = require('./models/Item');
const Participant = require('./models/Participant');
const Completion = require('./models/Completion');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cringe-club';
const PORT = process.env.PORT || 3000;

// --- Items ---

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ votes: -1, createdAt: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const item = await Item.create({ text: text.trim() });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items/:id/vote', async (req, res) => {
  try {
    const { direction } = req.body; // 'up' or 'down'
    const increment = direction === 'down' ? -1 : 1;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: increment } },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    await Completion.deleteMany({ itemId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Participants ---

app.get('/api/participants', async (req, res) => {
  try {
    const participants = await Participant.find().sort({ createdAt: 1 });
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/participants', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const participant = await Participant.create({ name: name.trim() });
    res.status(201).json(participant);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Participant already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- Completions ---

app.get('/api/completions', async (req, res) => {
  try {
    const completions = await Completion.find();
    res.json(completions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/completions', async (req, res) => {
  try {
    const { itemId, participant, completed } = req.body;
    if (!itemId || !participant) {
      return res.status(400).json({ error: 'itemId and participant are required' });
    }
    const completion = await Completion.findOneAndUpdate(
      { itemId, participant },
      { completed, completedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json(completion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const itemCount = await Item.countDocuments();
  const partCount = await Participant.countDocuments();
  console.log(`Database has ${itemCount} challenges and ${partCount} participants`);

  app.listen(PORT, () => {
    console.log(`Cringe Club running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
