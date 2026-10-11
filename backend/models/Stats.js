const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  totalScore: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 }
});

StatsSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Stats', StatsSchema);
