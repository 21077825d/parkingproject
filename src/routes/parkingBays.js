import express from 'express';
import { connectToDatabase } from '../utils/db.js';

const router = express.Router();

// Get all parking bays
router.get('/', async (req, res) => {
  const db = await connectToDatabase();
  const parkingBays = await db.collection('parkingbay').find().toArray(); // Use the correct collection name
  res.json(parkingBays);
});

// Add new parking bays
router.post('/', async (req, res) => {
  const newBays = req.body;
  const db = await connectToDatabase();
  await db.collection('parkingbay').insertMany(newBays); // Use the correct collection name
  res.status(201).json({ message: 'Parking bays added' });
});

// Delete a parking bay
router.delete('/:bayId', async (req, res) => {
  const { bayId } = req.params;
  const db = await connectToDatabase();
  await db.collection('parkingbay').deleteOne({ bayId }); // Use the correct collection name
  res.send(`Parking bay ${bayId} deleted successfully`);
});

// Update a parking bay (disable/enable)
router.patch('/:bayId', async (req, res) => {
  const { bayId } = req.params;
  const { enabled, email } = req.body; // Include email in the request body
  const db = await connectToDatabase();
  await db.collection('parkingbay').updateOne({ bayId }, { $set: { enabled, email } }, { upsert: true }); // Update enabled and email
  res.send(`Parking bay ${bayId} updated successfully`);
});

// Save disabled bays
router.post('/disable', async (req, res) => {
  const disabledBays = req.body;
  const db = await connectToDatabase();
  const bulkOps = disabledBays.map((disabledBay) => ({
    updateOne: {
      filter: { bayId: disabledBay.bayId },
      update: { $set: { enabled: false } },
      upsert: true,
    },
  }));
  await db.collection('parkingbay').bulkWrite(bulkOps); // Use the correct collection name
  res.send('Disabled bays saved successfully');
});

export default router;
