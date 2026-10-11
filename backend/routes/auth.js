const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

function signToken(user) {
  const payload = { user: { id: user.id } };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || !name || !email || !password) return res.status(400).json({ msg: 'Name, email and password are required' });
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password });
    await user.save();

    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) return res.status(400).json({ msg: 'Email and password are required' });
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

const authMiddleware = require('../middleware/auth');
const DailyLog = require('../models/DailyLog');
const Stats = require('../models/Stats');

// @route   GET api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).send('Server Error') }
});

// @route   PUT api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name) user.name = name;
    if (password) user.password = password; // Bcrypt pre-save hook handles hashing

    await user.save();
    res.json({ msg: 'Profile updated' });
  } catch (err) { res.status(500).send('Server Error') }
});

// @route   DELETE api/auth/reset
router.delete('/reset-progress', authMiddleware, async (req, res) => {
  try {
    await DailyLog.deleteMany({ userId: req.user.id });
    await Stats.deleteMany({ userId: req.user.id });
    res.json({ msg: 'All progress reset successfully' });
  } catch (err) { res.status(500).send('Server error') }
});

module.exports = router;
