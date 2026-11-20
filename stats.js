import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { Alert } from '../models/Alert.js';
import { Incident } from '../models/Incident.js';
import { HelpRequest } from '../models/HelpRequest.js';

const router = Router();
const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.n]));
const count = (field) => [{ $group: { _id: field, n: { $sum: 1 } } }];

// Dashboard numbers and analytics. Residents see their own totals; staff see everything.
router.get('/', protect, async (req, res) => {
  const mine = req.user.role === 'resident';
  const incScope = mine ? { reporter: req.user._id } : {};
  const reqScope = mine ? { requester: req.user._id } : {};

  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 6);

  const [activeAlerts, incidents, requests, incByStatus, reqByStatus, byCategory, daily, hotspots] = await Promise.all([
    Alert.countDocuments({ active: true }),
    Incident.countDocuments(incScope),
    HelpRequest.countDocuments(reqScope),
    Incident.aggregate([{ $match: incScope }, ...count('$status')]),
    HelpRequest.aggregate([{ $match: reqScope }, ...count('$status')]),
    Incident.aggregate([{ $match: incScope }, ...count('$category'), { $sort: { n: -1 } }]),
    Incident.aggregate([
      { $match: { ...incScope, createdAt: { $gte: since } } },
      ...count({ $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }),
    ]),
    Incident.aggregate([{ $match: incScope }, ...count({ $toLower: '$location.text' }), { $sort: { n: -1 } }, { $limit: 5 }]),
  ]);

  const dailyMap = toMap(daily);
  const trend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const day = d.toISOString().slice(0, 10);
    return { day, n: dailyMap[day] || 0 };
  });

  res.json({
    activeAlerts,
    incidents,
    requests,
    incidentsByStatus: toMap(incByStatus),
    requestsByStatus: toMap(reqByStatus),
    incidentsByCategory: toMap(byCategory),
    trend,
    hotspots: hotspots.map((h) => ({ location: h._id, n: h.n })),
  });
});

export default router;
