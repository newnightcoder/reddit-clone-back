import "dotenv/config";
import mysql from "mysql2";

// LOCAL DB:
const dbConfigLocal = {
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASS_LOCAL,
  database: "forum_backup",
};

// DB ON HEROKU / CLEARdb 😅
const dbConfig = {
  host: "eu-cdbr-west-02.cleardb.net",
  user: "b97aba0f0938eb",
  password: process.env.SQL_PASS_HEROKU,
  database: "heroku_3b1889097b1e2de",
};

// DB ON AWS 🤩👌🏾
// const dbConfig = {
//   host: process.env.SQL_HOST_AWS,
//   user: "admin",
//   password: process.env.SQL_PASS_AWS,
//   database: "forumdb",
// };

const pool = mysql.createPool(dbConfig);
export const db = pool.promise();
