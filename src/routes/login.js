import express from 'express';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '../utils/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, password } = req.body;
  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ userId });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid user ID or password');
  }

  req.session.userId = user.id;
  req.session.account = user.account; // Store account type in session

  if (user.account === 'admin') {
    res.redirect('/admin.html');
  } else {
    res.redirect('/profile.html');
  }
});

export default router;
