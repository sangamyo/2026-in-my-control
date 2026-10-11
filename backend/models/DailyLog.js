const mongoose = require('mongoose');

const DailyLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  completed: { type: Boolean, default: false },
  score: { type: Number, default: 0 }
});

DailyLogSchema.index({ userId: 1, date: 1, habitId: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', DailyLogSchema);
