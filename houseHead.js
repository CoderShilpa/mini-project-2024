const mongoose = require('mongoose');

const houseHeadSchema = new mongoose.Schema({
    houseHeadName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    details: { type: String, required: true }
});

module.exports = mongoose.model('HouseHead', houseHeadSchema);
