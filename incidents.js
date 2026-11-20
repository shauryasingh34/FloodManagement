import { body } from 'express-validator';
import { Incident, CATEGORIES } from '../models/Incident.js';
import { makeReportRouter } from './reportRouter.js';
import { uploadPhoto } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const router = makeReportRouter(Incident, 'reporter');

// Multipart form: photo is optional. Fields are validated after multer has parsed them.
router.post(
  '/',
  uploadPhoto,
  [
    body('category').isIn(CATEGORIES),
    body('locationText').isString().trim().isLength({ min: 3, max: 160 }),
    body('description').isString().trim().isLength({ min: 10, max: 1000 }),
    body('waterLevelCm').optional({ values: 'falsy' }).isFloat({ min: 0, max: 2000 }).toFloat(),
    body('lat').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).toFloat(),
    body('lng').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).toFloat(),
  ],
  validate,
  async (req, res) => {
    const { category, locationText, description, waterLevelCm, lat, lng } = req.body;
    const incident = await Incident.create({
      reporter: req.user._id,
      category,
      description,
      waterLevelCm,
      location: { text: locationText, lat, lng },
      photo: req.file ? `/uploads/${req.file.filename}` : undefined,
      priority: waterLevelCm >= 100 ? 'High' : 'Medium', // simple first-pass triage; staff can change it
      history: [{ status: 'Submitted', by: req.user._id }],
    });
    res.status(201).json(incident);
  }
);

export default router;
