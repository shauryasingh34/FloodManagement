import mongoose from 'mongoose';

export const SEVERITIES = ['Low', 'Moderate', 'High', 'Severe'];

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    severity: { type: String, enum: SEVERITIES, default: 'Moderate' },
    location: { type: String, required: true, trim: true, maxlength: 160 },
    active: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Alert = mongoose.model('Alert', alertSchema);
