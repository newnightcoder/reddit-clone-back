import "dotenv/config";
import mysql from "mysql2";

export const dbConfig = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: process.env.SQL_PASS,
  DB: "redditDB",
};

export const db = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});
