import express from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '../utils/db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, nickname, password, repeatPassword, email, gender, birthdate } = req.body;

  if (userId.length < 3) {
    return res.status(400).json('User ID must be at least 3 characters');
  }

  if (password.length < 8) {
    return res.status(400).json('Password must be at least 8 characters');
  }

  if (password !== repeatPassword) {
    return res.status(400).send('Passwords do not match');
  }

  const db = await connectToDatabase();
  const existingUser = await db.collection('users').findOne({ userId });
  if (existingUser) {
    return res.status(400).send('User ID already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    account: 'user',
    id: uuidv4(),
    userId,
    nickname,
    password: hashedPassword,
    email,
    gender,
    birthdate,
    profilePic: '/assets/profile/default-profile.png',
  };

  await db.collection('users').insertOne(newUser);

  res.redirect('/success-register.html');
});

export default router;
