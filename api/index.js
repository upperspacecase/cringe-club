require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const Item = require('../models/Item');
const Participant = require('../models/Participant');
const Completion = require('../models/Completion');

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cringe-club';

// Cache MongoDB connection between serverless invocations
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI, { dbName: 'test' });
  isConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

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
    const { direction } = req.body;
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

module.exports = app;
