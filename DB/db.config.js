import "dotenv/config";
import mysql from "mysql2";

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

//mysql://b97aba0f0938eb:a723d660@eu-cdbr-west-02.cleardb.net/heroku_3b1889097b1e2de?reconnect=true
//('Cannot add or update a child row: a foreign key constraint fails
//(`heroku_3b1889097b1e2de`.`tbl_like`, CONSTRAINT `fk_commentId_like` FOREIGN KEY (`fk_commentId_like`) REFERENCES `tbl_comments` (`commentId`) ON DELETE CASCADE ON UPDATE NO ACTION)', 1452)
