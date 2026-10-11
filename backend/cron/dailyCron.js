const cron = require('node-cron');
const { computeStreaks } = require('../utils/streak');
const Stats = require('../models/Stats');
const DailyLog = require('../models/DailyLog');
const { startOfDay } = require('date-fns');

// Run daily at 00:05 server time
cron.schedule('5 0 * * *', async () => {
  try {
    const today = startOfDay(new Date());
    const User = require('../models/User'); // Import User model
    const users = await User.find({});

    for (const user of users) {
      // compute total score for today for each user
      const agg = await DailyLog.aggregate([
        { $match: { userId: user._id, date: today } },
        { $group: { _id: null, totalScore: { $sum: '$score' }, completed: { $sum: { $cond: ['$completed', 1, 0] } }, total: { $sum: 1 } } }
      ]);
      const data = agg[0] || { totalScore: 0, completed: 0, total: 0 };

      const { current, longest } = await computeStreaks(user._id, today);

      // upsert stats for today for each user
      await Stats.findOneAndUpdate(
        { userId: user._id, date: today },
        { totalScore: data.totalScore, streak: current, longestStreak: longest, completionRate: data.total ? (data.completed / data.total) : 0 },
        { upsert: true }
      );
    }

    console.log('Daily cron: stats updated for all users for', today.toISOString().slice(0,10));
  } catch (err) {
    console.error('Daily cron error', err);
  }
});

module.exports = {};
