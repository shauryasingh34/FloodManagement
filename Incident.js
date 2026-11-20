import mongoose from 'mongoose';
import { trackingFields } from './shared.js';

export const CATEGORIES = ['river_flooding', 'waterlogging', 'road_blocked', 'landslide', 'power_outage', 'other'];

const incidentSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: CATEGORIES, required: true },
    waterLevelCm: { type: Number, min: 0, max: 2000 },
    photo: String,
    ...trackingFields,
  },
  { timestamps: true }
);

export const Incident = mongoose.model('Incident', incidentSchema);
