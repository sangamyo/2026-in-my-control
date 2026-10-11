const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { computeStreaks } = require('../utils/streak');
const DailyLog = require('../models/DailyLog');
const { startOfDay, subDays, format } = require('date-fns');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const today = startOfDay(new Date());
    
    // Aggregating today's performance
    const todayLog = await DailyLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), date: today } },
      { $group: { _id: null, totalScore: { $sum: '$score' }, completedCount: { $sum: { $cond: ['$completed', 1, 0] } }, totalCount: { $sum: 1 } } }
    ]);

    // Recalculating streaks natively
    const streaks = await computeStreaks(req.user.id, today);
    
    const performance = todayLog[0] || { totalScore: 0, completedCount: 0, totalCount: 0 };
    const completionRate = performance.totalCount ? Math.round((performance.completedCount / performance.totalCount) * 100) : 0;

    // Weekly points for the line graph
    const weeklyStart = startOfDay(subDays(today, 6));
    const weeklyPoints = await DailyLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), date: { $gte: weeklyStart } } },
      { $group: { _id: '$date', points: { $sum: '$score' } } },
      { $sort: { _id: 1 } }
    ]);

    const mappedWeekly = weeklyPoints.map(wp => ({
      date: format(new Date(wp._id), 'MM-dd'), // local date; toISOString() would shift to UTC
      points: wp.points
    }));

    res.json({
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      totalCheckins: await DailyLog.countDocuments({ userId: req.user.id, completed: true }),
      completionRate,
      weeklyPoints: mappedWeekly,
      level: Math.floor((await DailyLog.countDocuments({ userId: req.user.id, completed: true })) / 10) + 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
