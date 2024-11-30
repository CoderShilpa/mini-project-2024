// models/officerModel.js
const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('Officer', officerSchema);
