import 'dotenv/config';
import { app } from './app.js';
import { connectDB } from './config/db.js';

const { PORT = 5000, JWT_SECRET } = process.env;
if (!JWT_SECRET || JWT_SECRET.length < 16) {
  console.error('Set JWT_SECRET (16+ characters) in server/.env');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && JWT_SECRET.startsWith('replace-with')) {
  console.error('Change the placeholder JWT_SECRET before running in production');
  process.exit(1);
}

await connectDB();
app.listen(PORT, () => console.log(`FloodWatch API listening on http://localhost:${PORT}`));
