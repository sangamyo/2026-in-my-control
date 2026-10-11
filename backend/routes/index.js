const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const auth = require('./auth');
const habits = require('./routes_habits');
const checkin = require('./routes_checkin');
const stats = require('./routes_stats');
const heatmap = require('./routes_heatmap');
const analytics = require('./routes_analytics');
const ai = require('./routes_ai');

router.use('/auth', auth);
router.use('/habits', authMiddleware, habits);
router.use('/checkin', authMiddleware, checkin);
router.use('/stats', authMiddleware, stats);
router.use('/heatmap', authMiddleware, heatmap);
router.use('/analytics', authMiddleware, analytics);
router.use('/ai-report', authMiddleware, ai);

module.exports = router;
