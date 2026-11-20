import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { User } from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const sign = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const email = body('email').isString().trim().toLowerCase().isEmail();

router.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2, max: 80 }),
    email,
    body('password').isString().isLength({ min: 8, max: 72 }),
    body('phone').optional({ values: 'falsy' }).isString().trim().isLength({ max: 20 }),
  ],
  validate,
  async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (await User.exists({ email })) return res.status(409).json({ message: 'That email is already registered' });
    // Public sign-up always creates a resident; responders/admins are promoted by an admin.
    const user = await User.create({ name, email, password, phone, role: 'resident' });
    res.status(201).json({ token: sign(user), user });
  }
);

router.post(
  '/login',
  [email, body('password').isString().isLength({ min: 1, max: 72 })],
  validate,
  async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.checkPassword(req.body.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    res.json({ token: sign(user), user });
  }
);

router.get('/me', protect, (req, res) => res.json({ user: req.user }));

export default router;
