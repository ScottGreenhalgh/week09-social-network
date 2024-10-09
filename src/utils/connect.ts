import pg from "pg";

let db: pg.Pool | undefined;

export const connect = () => {
  if (!db) {
    db = new pg.Pool({
      connectionString: process.env.DB_URL,
    });
  }
  return db;
};
