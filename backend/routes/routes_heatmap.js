const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const { subDays, startOfDay, addDays, formatISO } = require('date-fns');

// Helper to build heatmap data for the past year
router.get('/', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '365', 10);
    const end = startOfDay(new Date());
    const start = startOfDay(subDays(end, days - 1));

    const mongoose = require('mongoose');
    const logs = await DailyLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id), date: { $gte: start, $lte: end } } },
      { $group: { _id: '$date', totalScore: { $sum: '$score' } } }
    ]);

    const map = new Map(logs.map(l => [formatISO(new Date(l._id), { representation: 'date' }), l.totalScore]));

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = addDays(start, i);
      const key = formatISO(d, { representation: 'date' });
      result.push({ date: key, score: map.get(key) || 0 });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
