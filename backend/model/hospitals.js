const mongoose = require('mongoose');
const { Schema } = mongoose;

const hospitalSchema = new Schema({
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
    name: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
})

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;