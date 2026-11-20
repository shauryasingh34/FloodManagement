import mongoose from 'mongoose';

// Incident status flow: Submitted → Under Review → Assigned → Resolved
export const STATUSES = ['Submitted', 'Under Review', 'Assigned', 'Resolved'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

const ref = (model) => ({ type: mongoose.Schema.Types.ObjectId, ref: model });

// Fields shared by incident reports and help requests
export const trackingFields = {
  location: {
    text: { type: String, required: true, trim: true, maxlength: 160 },
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
  },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  status: { type: String, enum: STATUSES, default: 'Submitted', index: true },
  priority: { type: String, enum: PRIORITIES, default: 'Medium' },
  assignedTo: ref('User'),
  history: [{ _id: false, status: String, by: ref('User'), at: { type: Date, default: Date.now } }],
};
