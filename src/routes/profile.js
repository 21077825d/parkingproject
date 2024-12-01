import express from 'express';
import { connectToDatabase } from '../utils/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ id: req.session.userId });

  if (!user) {
    return res.status(404).send('User not found');
  }

  res.json(user);
});

export default router;
