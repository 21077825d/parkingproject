import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from '../utils/db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../assets/events'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  const db = await connectToDatabase();
  const events = await db.collection('events').find().toArray();
  res.json({ events });
});

router.post('/create', upload.single('coverImage'), async (req, res) => {
  const { title, startDate, endDate, venue, description, discount } = req.body;
  const db = await connectToDatabase();
  const newEvent = {
    id: Date.now().toString(),
    title,
    startDate,
    endDate,
    venue,
    description,
    discount,
    coverImage: `/assets/events/${req.file.filename}`,
  };
  await db.collection('events').insertOne(newEvent);
  res.json({ message: 'Event created successfully' });
});

router.put('/edit/:id', upload.single('coverImage'), async (req, res) => {
  const { id } = req.params;
  const { title, date, time, venue, description } = req.body;
  const db = await connectToDatabase();
  const event = await db.collection('events').findOne({ id });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const updatedEvent = {
    ...event,
    title,
    date,
    time,
    venue,
    description,
    coverImage: req.file ? `/assets/events/${req.file.filename}` : event.coverImage,
  };

  await db.collection('events').updateOne({ id }, { $set: updatedEvent });
  res.json({ message: 'Event updated successfully' });
});

router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connectToDatabase();
  const result = await db.collection('events').deleteOne({ id });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json({ message: 'Event deleted successfully' });
});

export default router;
