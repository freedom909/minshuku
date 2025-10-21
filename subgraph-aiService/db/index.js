import { Pool } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:3306/air'
});

export default {
  query: (text, params) => pool.query(text, params)
};