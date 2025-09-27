import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query<T>(text, params);
  return res.rows as unknown as T[];
}
