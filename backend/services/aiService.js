const DailyLog = require('../models/DailyLog');
const Habit = require('../models/Habit');
const Stats = require('../models/Stats');
const { startOfDay, subDays } = require('date-fns');

/**
 * Very small heuristic AI report generator.
 * Replace with LLM/ML integration in production.
 */
async function generateReport({ userId, from, to } = {}) {
  const end = to ? startOfDay(new Date(to)) : startOfDay(new Date());
  const start = from ? startOfDay(new Date(from)) : startOfDay(subDays(end, 6)); // default 7 days

  // Fetch logs and habits
  const logs = await DailyLog.find({ userId, date: { $gte: start, $lte: end } });
  const habits = await Habit.find({ userId });

  // Build per-habit summary
  const perHabit = {};
  for (const h of habits) perHabit[h._id] = { title: h.title, total: 0, completed: 0 };
  for (const l of logs) {
    const p = perHabit[l.habitId] || { title: 'Unknown', total: 0, completed: 0 };
    p.total += 1;
    if (l.completed) p.completed += 1;
    perHabit[l.habitId] = p;
  }

  const sorted = Object.values(perHabit).map(p => ({ title: p.title, completionRate: p.total ? p.completed / p.total : 0 })).sort((a,b) => b.completionRate - a.completionRate);

  // Consistency % = average completionRate
  const consistency = sorted.length ? Math.round((sorted.reduce((s, x) => s + x.completionRate, 0) / sorted.length) * 100) : 0;

  // Weak habit
  const weak = sorted.slice(-1)[0] || null;
  const best = sorted[0] || null;

  // Streak safety prediction (simple heuristic): if consistency < 50% then 'At Risk'
  const streakRisk = consistency < 50 ? 'At Risk' : (consistency < 80 ? 'Caution' : 'Safe');

  // Suggestions: simple rules
  const suggestions = [];
  if (consistency < 50) suggestions.push('Reduce daily load: focus on top 1-2 goals for 2 weeks.');
  if (streakRisk === 'At Risk') suggestions.push('Add a micro-habit or set a simpler daily goal to maintain momentum.');
  if (best) suggestions.push(`Leverage your best habit "${best.title}" as an anchor to pair weaker habits.`);

  const report = {
    period: { start, end },
    consistencyPercent: consistency,
    bestHabit: best,
    weakHabit: weak,
    streakRisk,
    suggestions,
    summary: `Between ${start.toISOString().slice(0,10)} and ${end.toISOString().slice(0,10)} your average consistency was ${consistency}%.` 
  };

  return report;
}

module.exports = { generateReport };
