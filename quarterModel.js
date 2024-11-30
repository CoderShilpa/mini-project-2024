const mongoose = require('mongoose');

const quarterSchema = new mongoose.Schema({
  rationCardNumber: { type: String, required: true, unique: true },
  familyHeadName: { type: String, required: true },
  familyMembers: { type: [String], required: true }
});

module.exports = mongoose.model('Quarter', quarterSchema);
