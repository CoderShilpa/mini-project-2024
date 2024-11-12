const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Import UUID for unique complaint IDs
const Officer = require('./models/officerModel'); // Officer model
const Complaint = require('./models/complaintModel'); // Complaint model
const path = require('path'); // Import path module

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];
// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Check if the incoming origin is in the allowedOrigins array
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true  // Allow credentials (cookies or session data)
}));
// Session configuration
app.use(session({
  secret: '4Q6VExxFeGs8fp2a',  // Replace with your secret key
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,   // Set to true if using HTTPS
    sameSite: 'Lax'  // Adjust to 'Lax' or 'None' as required
  }
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect('mongodb+srv://upadhyayshilpa57:4Q6VExxFeGs8fp2a@cluster4.ggjni.mongodb.net/?retryWrites=true&w=majority&appName=cluster4', {
  serverSelectionTimeoutMS: 60000,  // 60 seconds
  connectTimeoutMS: 10000           // 10 seconds
})
.then(() => console.log('Database connected'))
.catch(error => console.error('Database connection error:', error));

// Officer login route

// Submit a new complaint
app.post('/api/complaints', async (req, res) => {
  const { name, address, contact, title, description } = req.body;
  
  // Generate a unique complaint ID
  const complaintId = uuidv4(); 

  try {
    const complaint = new Complaint({
      complaintId,  // Save the generated complaint ID
      name,
      address,
      contact,
      title,
      description,
      createdAt: new Date()  // Track when the complaint was created
    });
    
    await complaint.save();
    
    // Return the complaint ID to the user
    res.status(201).json({ message: 'Complaint submitted successfully', complaintId });
  } catch (error) {
    console.error('Error submitting complaint:', error); // Detailed log
    res.status(500).json({ message: 'Error submitting complaint', error: error.message });
  }
});

app.post('/api/officer/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const officer = await Officer.findOne({ email, password });
    if (officer) {
      req.session.officer = officer;  // Store officer in session
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error });
  }
});

// Fetch complaints only if the officer is logged in
app.get('/api/complaints', (req, res) => {
  if (!req.session.officer) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  Complaint.find({}, (err, complaints) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching complaints', error: err });
    }
    res.json(complaints);
  });
});

// Officer logout route
app.post('/api/officer/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});
app.get('/api/test', (req, res) => {
  res.send("Server is working!");
});

// Optional: Scheduled Job to Track Unresolved Complaints
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {  // Runs daily at midnight
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  try {
    const unresolvedComplaints = await Complaint.find({
      createdAt: { $lt: threeMonthsAgo }
    });

    unresolvedComplaints.forEach(complaint => {
      console.log(`Complaint ID ${complaint.complaintId} is unresolved for over 3 months.`);
      // Implement additional actions, like sending an email reminder if necessary
    });
  } catch (error) {
    console.error('Error checking unresolved complaints:', error);
  }
});

// Specific route for the complain.html page
app.get('/complain.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'complain.html'));
});

// Optional: Default route to handle the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'complain.html'));
});

// Start the server
app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});
