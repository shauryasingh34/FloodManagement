import { Router } from 'express';
import { body, param, matchedData } from 'express-validator';
import { Alert, SEVERITIES } from '../models/Alert.js';
import { protect, isStaff, isAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const text = (field, min, max) => body(field).isString().trim().isLength({ min, max });
const fields = (optional) => [
  optional ? text('title', 3, 120).optional() : text('title', 3, 120),
  optional ? text('message', 5, 1000).optional() : text('message', 5, 1000),
  optional ? text('location', 2, 160).optional() : text('location', 2, 160),
  (optional ? body('severity').optional() : body('severity')).isIn(SEVERITIES),
];

// Public: anyone can read active alerts
router.get('/', async (req, res) => {
  res.json(await Alert.find({ active: true }).sort({ createdAt: -1 }).limit(50));
});

// Staff: includes withdrawn alerts
router.get('/all', protect, isStaff, async (req, res) => {
  res.json(await Alert.find().sort({ createdAt: -1 }).limit(100));
});

router.post('/', protect, isStaff, fields(false), validate, async (req, res) => {
  const { title, message, location, severity } = req.body;
  res.status(201).json(await Alert.create({ title, message, location, severity, createdBy: req.user._id }));
});

router.patch(
  '/:id',
  protect,
  isStaff,
  [param('id').isMongoId(), ...fields(true), body('active').optional().isBoolean().toBoolean()],
  validate,
  async (req, res) => {
    const update = matchedData(req, { locations: ['body'] });
    const alert = await Alert.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  }
);

router.delete('/:id', protect, isAdmin, [param('id').isMongoId()], validate, async (req, res) => {
  const alert = await Alert.findByIdAndDelete(req.params.id);
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  res.status(204).end();
});

export default router;
