import express from 'express';
import { connectToDatabase } from '../utils/db.js';

const router = express.Router();

router.get('/users', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const db = await connectToDatabase();
  const users = await db.collection('users').find().toArray();
  const adminUser = users.find((user) => user.id === req.session.userId && user.userId === 'admin');

  if (!adminUser) {
    return res.status(403).send('Forbidden');
  }

  const usersWithBookings = await Promise.all(
    users.map(async (user) => {
      const userBookings = await db.collection('bookings').find({ email: user.email }).toArray();
      return {
        ...user,
        bookings: userBookings,
      };
    })
  );

  res.json({ users: usersWithBookings });
});

export default router;
