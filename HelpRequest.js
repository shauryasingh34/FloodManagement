import mongoose from 'mongoose';
import { trackingFields } from './shared.js';

export const NEEDS = ['rescue', 'medical', 'food_water', 'shelter'];

const helpRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    need: { type: String, enum: NEEDS, required: true },
    peopleCount: { type: Number, min: 1, max: 500, default: 1 },
    contactPhone: { type: String, trim: true, maxlength: 20 },
    ...trackingFields,
  },
  { timestamps: true }
);

export const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);
