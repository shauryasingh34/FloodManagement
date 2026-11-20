import { body } from 'express-validator';
import { HelpRequest, NEEDS } from '../models/HelpRequest.js';
import { makeReportRouter } from './reportRouter.js';
import { validate } from '../middleware/validate.js';

const router = makeReportRouter(HelpRequest, 'requester');

router.post(
  '/',
  [
    body('need').isIn(NEEDS),
    body('peopleCount').optional({ values: 'falsy' }).isInt({ min: 1, max: 500 }).toInt(),
    body('locationText').isString().trim().isLength({ min: 3, max: 160 }),
    body('contactPhone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 20 }),
    body('description').isString().trim().isLength({ min: 5, max: 1000 }),
    body('lat').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).toFloat(),
    body('lng').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).toFloat(),
  ],
  validate,
  async (req, res) => {
    const { need, peopleCount, locationText, contactPhone, description, lat, lng } = req.body;
    const request = await HelpRequest.create({
      requester: req.user._id,
      need,
      peopleCount,
      contactPhone: contactPhone || req.user.phone,
      description,
      location: { text: locationText, lat, lng },
      priority: need === 'rescue' || need === 'medical' ? 'High' : 'Medium',
      history: [{ status: 'Submitted', by: req.user._id }],
    });
    res.status(201).json(request);
  }
);

export default router;
