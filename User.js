import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['resident', 'responder', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'resident' },
    phone: { type: String, trim: true, maxlength: 20 },
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, ret) => { delete ret.password; delete ret.__v; return ret; } },
  }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model('User', userSchema);
