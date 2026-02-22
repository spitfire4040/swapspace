import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pool from './config/db';
import { createApp } from './app';

// Ensure upload directories exist
const uploadDirs = [
  path.join(process.cwd(), 'uploads', 'originals'),
  path.join(process.cwd(), 'uploads', 'thumbnails'),
];
for (const dir of uploadDirs) {
  fs.mkdirSync(dir, { recursive: true });
}

const PORT = parseInt(process.env.PORT ?? '4000', 10);

async function start() {
  // Verify DB connection
  await pool.query('SELECT 1');
  console.log('Database connected');

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`SwapSpace backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
