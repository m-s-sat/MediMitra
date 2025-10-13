const mongoose = require('mongoose');
const { Schema } = mongoose;

const doctorSchema = new Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    department: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    qualification: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    opdDays: {
        type: [String],
        required: true
    },
    isVerified: { type: Boolean, default: false },
})

const hospitalRegSchema = new Schema({
    role: {
        type: String,
        required: true,
        default: 'hospital'
    },
    hospital: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        type: { type: String, required: true },
        state: { type: String, required: true },
        district: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            long: { type: Number, required: true }
        }
    },
    admin: {
        name: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: { type: String, required: true },
        password: { type: String, required: true }
    },
    departments: {
        type: [String],
        required: true
    },
    emergency_contact: {
        type: String
    },
    visiting_hours: {
        start: { type: String },
        end: { type: String }
    },
    doctors: [doctorSchema]
}, { timestamps: true });

const HospitalReg = mongoose.model('Hospitalreg', hospitalRegSchema);
module.exports = HospitalReg;