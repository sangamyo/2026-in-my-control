const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// @route  POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const habit = new Habit({ title, userId: req.user.id });
    await habit.save();
    res.status(201).json(habit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route  GET /api/habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route  PUT /api/habits/:id
router.put('/:id', async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.title === 'string') update.title = req.body.title;
    if (typeof req.body.active === 'boolean') update.active = req.body.active;
    const habit = await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, update, { new: true });
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });
    res.json(habit);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route  DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!habit) return res.status(404).json({ msg: 'Habit not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
