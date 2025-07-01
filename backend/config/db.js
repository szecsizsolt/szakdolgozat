import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config(); // Betölti a .env-et

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
