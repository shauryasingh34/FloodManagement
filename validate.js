import fs from 'fs';
import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  if (req.file) fs.unlink(req.file.path, () => {}); // don't keep uploads from rejected requests
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  res.status(400).json({ message: `Please check the "${errors[0].field}" field.`, errors });
};
