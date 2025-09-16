import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'sistema_feedback_v2',
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

export default pool;
