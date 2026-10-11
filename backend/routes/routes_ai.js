const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// GET /api/ai-report?from=2026-01-01&to=2026-02-01
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    const report = await aiService.generateReport({ userId: req.user.id, from, to });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
