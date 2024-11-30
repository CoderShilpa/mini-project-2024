const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const Quarter = require('./models/quarterModel'); // Adjust the path as necessary
const User = require('./models/userModel'); // Adjust the path as necessary

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb+srv://upadhyayshilpa57:4Q6VExxFeGs8fp2a@cluster4.ggjni.mongodb.net/nayi_disha?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => {
  console.error("MongoDB connection error:", error);
});

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Route to serve the main page (login page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Assuming your HTML file is named index.html
});

// Endpoint to handle user login (user creation)
app.post('/login', async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received login data:", req.body); // Debug log

  try {
    const user = await User.create({ name, email, password });
    console.log("User created successfully:", user); // Confirm data
    res.status(201).send("User created successfully");
  } catch (error) {
    console.error("Error during user creation:", error);
    res.status(500).send("Error creating user");
  }
});

// Endpoint to handle quarter allotment
app.post('/allot-quarter', async (req, res) => {
  const { rationCardNumber, familyHeadName, familyMembers } = req.body;
  console.log("Received allotment data:", req.body); // Debug log

  try {
    // Check if the ration card number already exists in the database
    const existingEntry = await Quarter.findOne({ ration_card_number: rationCardNumber });
    if (existingEntry) {
      console.log("Quarter already allotted to this family."); // Confirm conflict
      return res.status(400).send("Quarter already allotted to this family.");
    } else {
      // Create a new entry and allot the quarter
      const newEntry = new Quarter({
        ration_card_number: rationCardNumber,
        family_head_name: familyHeadName,
        family_members: familyMembers,
        quarter_allotted: true
      });

      await newEntry.save();
      console.log("Quarter successfully allotted:", newEntry); // Confirm success
      return res.status(201).send("Quarter successfully allotted.");
    }
  } catch (error) {
    console.error("Error handling quarter allotment:", error);
    return res.status(500).send("Error processing request: " + error.message);
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
