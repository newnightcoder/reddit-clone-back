import "dotenv/config";
import mysql from "mysql2";

// LOCAL DB:
// const dbConfig = {
//   host: "localhost",
//   user: "root",
//   password: process.env.SQL_PASS,
//   database: "redditDB",
// };

const dbConfig = {
  host: "eu-cdbr-west-02.cleardb.net",
  user: "b97aba0f0938eb",
  password: process.env.SQL_PASS,
  database: "heroku_3b1889097b1e2de",
};

const pool = mysql.createPool(dbConfig);
export const db = pool.promise();
