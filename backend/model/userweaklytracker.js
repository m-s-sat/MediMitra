const mongoose = require('mongoose');
const { Schema } = mongoose;

const userWeeklyTrackerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  steps: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  activeMinutes: { type: Number, default: 0 },
});

const UserWeeklyTracker = mongoose.model('UserWeeklyTracker', userWeeklyTrackerSchema);

module.exports = UserWeeklyTracker;
