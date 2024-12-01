import { MongoClient } from 'mongodb';

const uri =
  'mongodb+srv://tzjai123:hot1fkcWAWtehs1z@cluster0.lutxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

export const connectToDatabase = async () => {
  if (!db) {
    try {
      await client.connect();
      db = client.db('carparking'); // Use the correct database name
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }
  return db;
};
