// Run all SQL migrations in order
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const migrationsDir = path.join(__dirname, '../src/db/migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
    console.log(`  ✓ Done`);
  }

  await pool.end();
  console.log('All migrations complete.');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
