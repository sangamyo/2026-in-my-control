const express = require('express');
const router = express.Router();
const DailyLog = require('../models/DailyLog');
const Habit = require('../models/Habit');
const { startOfDay, parseISO } = require('date-fns');

// @route  GET /api/checkin?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const day = startOfDay(date ? parseISO(date) : new Date());
    const logs = await DailyLog.find({ userId: req.user.id, date: day });
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route  POST /api/checkin
router.post('/', async (req, res) => {
  try {
    const { date, habitId, completed, score } = req.body;
    const day = startOfDay(date ? parseISO(date) : new Date());

    if (!habitId) return res.status(400).json({ error: "Missing habitId" });

    const valScore = completed ? (score || 1) : 0;
    const log = await DailyLog.findOneAndUpdate(
      { userId: req.user.id, date: day, habitId },
      { completed: !!completed, score: valScore },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(log);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
