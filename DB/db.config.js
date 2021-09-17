import "dotenv/config";
import mysql from "mysql2";

export const dbConfig = {
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASS,
  database: "redditDB",
};

export const db = mysql.createPool(dbConfig);
