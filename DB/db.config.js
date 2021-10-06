import "dotenv/config";
import mysql from "mysql2";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASS,
  database: "redditDB",
};

const pool = mysql.createPool(dbConfig);
export const db = pool.promise();
