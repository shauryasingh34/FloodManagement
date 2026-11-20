import { Router } from 'express';
import { body, param, query, matchedData } from 'express-validator';
import { protect, isStaff } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { User } from '../models/User.js';
import { STATUSES, PRIORITIES } from '../models/shared.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Shared list + triage endpoints for incident reports and help requests.
 * - Residents only ever see their own records.
 * - Responders and admins see everything and can update status, priority and assignee.
 */
export function makeReportRouter(Model, ownerField) {
  const router = Router();
  router.use(protect);

  router.get(
    '/',
    [
      query('status').optional().isIn(STATUSES),
      query('priority').optional().isIn(PRIORITIES),
      query('q').optional().isString().isLength({ max: 80 }),
    ],
    validate,
    async (req, res) => {
      const { status, priority, q } = req.query;
      const filter = {};
      if (req.user.role === 'resident') filter[ownerField] = req.user._id;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (q) {
        const rx = new RegExp(escapeRegex(q), 'i');
        filter.$or = [{ 'location.text': rx }, { description: rx }];
      }
      const items = await Model.find(filter)
        .sort({ createdAt: -1 })
        .limit(200)
        .populate(ownerField, 'name phone')
        .populate('assignedTo', 'name');
      res.json(items);
    }
  );

  router.patch(
    '/:id',
    isStaff,
    [
      param('id').isMongoId(),
      body('status').optional().isIn(STATUSES),
      body('priority').optional().isIn(PRIORITIES),
      body('assignedTo').optional().isMongoId(),
    ],
    validate,
    async (req, res) => {
      const { status, priority, assignedTo } = matchedData(req, { locations: ['body'] });
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ message: 'Record not found' });

      if (assignedTo) {
        const staff = await User.exists({ _id: assignedTo, role: { $in: ['responder', 'admin'] } });
        if (!staff) return res.status(400).json({ message: 'Only responders or admins can be assigned' });
        doc.assignedTo = assignedTo;
      }
      if (priority) doc.priority = priority;
      if (status && status !== doc.status) {
        doc.status = status;
        doc.history.push({ status, by: req.user._id });
      }
      await doc.save();
      await doc.populate([{ path: ownerField, select: 'name phone' }, { path: 'assignedTo', select: 'name' }]);
      res.json(doc);
    }
  );

  return router;
}
