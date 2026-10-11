const Stats = require('../models/Stats');
const DailyLog = require('../models/DailyLog');
const { startOfDay, subDays, formatISO } = require('date-fns');

/**
 * Compute streaks from DailyLog for a given end date and user.
 * A day is considered successful if total score > 0.
 */
async function computeStreaks(userId, endDate = new Date()) {
  const end = startOfDay(endDate);
  const daysToCheck = 365; // compute longest possible
  const start = subDays(end, daysToCheck - 1);
  const mongoose = require('mongoose');

  const agg = await DailyLog.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: '$date', totalScore: { $sum: '$score' } } },
    { $sort: { _id: 1 } }
  ]);

  const successSet = new Set(agg.filter(a => a.totalScore > 0).map(a => formatISO(new Date(a._id), { representation: 'date' })));

  // compute current streak and longest streak
  let current = 0, longest = 0, temp = 0;
  for (let i = 0; i < daysToCheck; i++) {
    const d = subDays(end, daysToCheck - 1 - i);
    const key = formatISO(d, { representation: 'date' });
    if (successSet.has(key)) {
      temp += 1;
      if (temp > longest) longest = temp;
    } else {
      temp = 0;
    }
  }

  // compute current streak from end backwards
  current = 0;
  for (let i = 0; i < daysToCheck; i++) {
    const d = subDays(end, i);
    const key = formatISO(d, { representation: 'date' });
    if (successSet.has(key)) current += 1; else break;
  }

  return { current, longest };
}

module.exports = { computeStreaks };
