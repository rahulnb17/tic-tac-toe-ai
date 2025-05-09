const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // Local MongoDB
const client = new MongoClient(uri);

let db;

async function connectDB() {
  await client.connect();
  db = client.db('tictactoe');
  console.log('Connected to MongoDB');
}

function getGameCollection() {
  return db.collection('moves');
}

module.exports = { connectDB, getGameCollection };
