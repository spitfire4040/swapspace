import 'dotenv/config';
import { supabaseAdmin } from './config/supabase';
import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

async function start() {
  // Validate required env vars
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  // Verify Supabase connection
  const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`);
  }
  console.log('Supabase connected');

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`SwapSpace backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
