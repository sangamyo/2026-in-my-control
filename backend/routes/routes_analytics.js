const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const { startOfDay, subDays } = require('date-fns');

// GET /api/analytics?range=7|30|90
router.get('/', async (req, res) => {
  try {
    const range = parseInt(req.query.range || '30', 10);
    const start = startOfDay(subDays(new Date(), range - 1));
    const mongoose = require('mongoose');

    const agg = await DailyLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), date: { $gte: start } } },
      { $group: { _id: '$date', totalScore: { $sum: '$score' }, completedCount: { $sum: { $cond: ['$completed', 1, 0] } }, totalCount: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Build time-series
    const series = agg.map(a => ({ date: a._id, totalScore: a.totalScore, completionRate: a.totalCount ? (a.completedCount / a.totalCount) : 0 }));

    // Simple analytics: average score and best/weak habit ids
    const byGoal = await DailyLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), date: { $gte: start } } },
      { $group: { _id: '$habitId', completed: { $sum: { $cond: ['$completed', 1, 0] } }, total: { $sum: 1 } } },
      { $project: { completionRate: { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$completed', '$total'] }] } } },
      { $sort: { completionRate: -1 } }
    ]);

    res.json({ range, series, byGoal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
