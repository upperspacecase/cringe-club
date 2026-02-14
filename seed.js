require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');
const Participant = require('./models/Participant');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cringe-club';

const initialItems = [
  'Go out looking dumb. (Go to a charity shop with a friend, have them pick out an awful outfit. Wear it on a weekend day.)',
  'Do an impromptu speech - ting ting ting ting ting.',
  'Say "well, this is awkward" in a convo, when it\'s really not.',
  'Solo carolling...',
  'Bartering in the wrong place, like the supermarket. One offer, second offer, "okay, final offer..."',
  'Pause for exactly 5 seconds before responding to any question. Window of 2 hours. Peak hours.',
  'Have a nap somewhere you\'re not supposed to.',
  'Record and send an awkward conversation that you\'ve been avoiding.',
  'Wear a snorkel for a day.'
];

const initialParticipants = ['Tim', 'Anna', 'Ieva', 'Seth', 'Tay'];

async function seed() {
  await mongoose.connect(MONGODB_URI, { dbName: 'test' });
  console.log('Connected to MongoDB');

  // Only seed if collections are empty
  const itemCount = await Item.countDocuments();
  const partCount = await Participant.countDocuments();

  if (itemCount === 0) {
    await Item.insertMany(initialItems.map(text => ({ text, votes: 0 })));
    console.log(`Seeded ${initialItems.length} challenges`);
  } else {
    console.log(`Items already exist (${itemCount}), skipping`);
  }

  if (partCount === 0) {
    await Participant.insertMany(initialParticipants.map(name => ({ name })));
    console.log(`Seeded ${initialParticipants.length} participants`);
  } else {
    console.log(`Participants already exist (${partCount}), skipping`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
