import express from 'express';
import { connectToDatabase } from '../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const db = await connectToDatabase();
  const users = await db.collection('users').find().toArray();
  const user = users.find((user) => user.id === req.session.userId);

  if (!user) {
    return res.status(404).send('User not found');
  }

  const bookings = await db.collection('bookings').find({ email: user.email }).toArray();

  if (!bookings.length) {
    return res.status(404).send('Bookings not found');
  }

  res.json({ bookings });
});

router.post('/', async (req, res) => {
  const newBooking = req.body;
  const db = await connectToDatabase();
  const userBooking = await db.collection('bookings').findOne({ email: newBooking.email });

  if (userBooking) {
    await db
      .collection('bookings')
      .updateOne({ email: newBooking.email }, { $push: { bookings: { $each: newBooking.bookings } } });
  } else {
    await db.collection('bookings').insertOne({
      email: newBooking.email,
      bookings: newBooking.bookings,
    });
  }

  res.status(201).json({ message: 'Booking saved' });
});

export default router;
