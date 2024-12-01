import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import multer from 'multer';
import bcrypt from 'bcrypt';
import { initializeUsers } from './utils/fileHelpers.js';
import loginRoutes from './routes/login.js';
import registerRoutes from './routes/register.js';
import profileRoutes from './routes/profile.js';
import bookingsRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import eventRoutes from './routes/events.js'; // Import event routes
import parkingBaysRoutes from './routes/parkingBays.js'; // Import parking bays routes
import { connectToDatabase } from './utils/db.js'; // Import MongoDB connection

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: '<Student ID>_eie4432_lab4',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

initializeUsers();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../assets/profile'));
  },
  filename: (req, file, cb) => {
    const userId = req.session.userId;
    cb(null, `${userId}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/profile', profileRoutes);
app.use('/bookings', bookingsRoutes);
app.use('/admin', adminRoutes);
app.use('/events', eventRoutes); // Use event routes
app.use('/parkingbays', parkingBaysRoutes); // Use parking bays routes

app.post('/update-profile', upload.single('profilePic'), async (req, res) => {
  const { nickname, password, email, gender, birthdate } = req.body;

  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }

  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ id: req.session.userId });

  if (!user) {
    return res.status(404).send('User not found');
  }

  user.nickname = nickname;
  user.email = email;
  user.gender = gender;
  user.birthdate = birthdate;

  if (req.file) {
    user.profilePic = `/assets/profile/${req.file.filename}`;
  }

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  await db.collection('users').updateOne({ id: req.session.userId }, { $set: user });

  res.send('Profile updated successfully');
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.send('Logout successful');
  });
});

app.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/index.html');
  }

  const db = await connectToDatabase();
  const user = await db.collection('users').findOne({ id: req.session.userId });

  if (user && user.account === 'admin') {
    return res.redirect('/admin.html');
  }

  res.redirect('/profile.html');
});

app.use('/', express.static(path.join(__dirname, '../static')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

app.use('/api/bookings', bookingsRoutes); // Use the bookings route for API
app.use('/api/parkingbays', parkingBaysRoutes); // Use the parking bays route for API

const PORT = 8020;
app.listen(PORT, () => {
  const currentDate = new Date().toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
  console.log(`Current date and time in HKT: ${currentDate}`);
  console.log(`Server started at http://127.0.0.1:${PORT}`);
});
