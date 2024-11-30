const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Officer = require('./models/officerModel');
const Complaint = require('./models/complaintModel');
const path = require('path');

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(session({
  secret: '4Q6VExxFeGs8fp2a',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb+srv://upadhyayshilpa57:4Q6VExxFeGs8fp2a@cluster4.ggjni.mongodb.net/test?retryWrites=true&w=majority', {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000,  // Optional for handling timeout
  family: 4                          // Optional: Forces IPv4
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => {
  console.error("MongoDB connection error:", error.message);
});

app.post('/api/officer/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const officer = await Officer.findOne({ email, password });
    if (officer) {
      req.session.officer = officer;
      res.status(200).json({ message: 'Login successful', token: 'some_token_value' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  const { name, address, contact, title, description } = req.body;
  const complaintId = uuidv4();

  try {
    const complaint = new Complaint({
      complaintId,
      name,
      address,
      contact,
      title,
      description,
      createdAt: new Date()
    });
    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully', complaintId });
  } catch (error) {
    console.error('Error submitting complaint:', error.message);
    res.status(500).json({ message: 'Error submitting complaint', error: error.message });
  }
});

app.get('/api/complaints', (req, res) => {
  if (!req.session.officer) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  Complaint.find({}, (err, complaints) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching complaints', error: err.message });
    }
    res.json(complaints);
  });
});

app.post('/api/officer/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

app.get('/complain.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'complain.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'complain.html'));
});

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});
