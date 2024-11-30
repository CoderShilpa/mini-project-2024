const mongoose = require('mongoose');

// Define the schema for users
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

// Export the model
module.exports = mongoose.model('User', userSchema);
