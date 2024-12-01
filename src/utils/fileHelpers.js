import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from './db.js';

// Read users from MongoDB
export const readUsersFromFile = async () => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  const users = await db.collection('users').find().toArray();
  return users;
};

// Read bookings from MongoDB
export const readBookingsFromFile = async () => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  const bookings = await db.collection('bookings').find().toArray();
  return bookings;
};

// Read parking bays from MongoDB
export const readParkingBaysFromFile = async () => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  const parkingBays = await db.collection('parkingbay').find().toArray();
  return parkingBays;
};

// Write users to MongoDB
export const writeUsersToFile = async (users) => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  await db.collection('users').insertMany(users);
};

// Write bookings to MongoDB
export const writeBookingsToFile = async (bookings) => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  await db.collection('bookings').insertMany(bookings);
};

// Write parking bays to MongoDB
export const writeParkingBaysToFile = async (parkingBays) => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  await db.collection('parkingbay').insertMany(parkingBays);
};

// Update parking bay status in MongoDB
export const updateParkingBayStatus = async (bayId, enabled, email) => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  await db.collection('parkingbay').updateOne({ bayId }, { $set: { enabled, email } }, { upsert: true });
};

// Read events from MongoDB
export const readEventsFromFile = async () => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  const events = await db.collection('events').find().toArray();
  return events;
};

// Write events to MongoDB
export const writeEventsToFile = async (events) => {
  const db = await connectToDatabase();
  if (!db) {
    throw new Error('Failed to connect to the database');
  }
  await db.collection('events').insertMany(events);
};

// Initialize users in MongoDB
export const initializeUsers = async () => {
  const users = await readUsersFromFile();
  const adminUser = users.find((user) => user.userId === 'admin');
  if (!adminUser) {
    const newAdminUser = {
      account: 'admin',
      id: uuidv4(),
      userId: 'admin',
      nickname: 'Administrator',
      password: bcrypt.hashSync('adminpass', 10),
      email: 'admin@example.com',
      gender: 'other',
      birthdate: '2000-01-01',
      profilePic: '/assets/profile/default-profile.png',
    };
    users.push(newAdminUser);
    await writeUsersToFile(users);
  }
};
