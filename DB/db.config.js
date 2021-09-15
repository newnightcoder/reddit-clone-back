import "dotenv/config";

export const dbConfig = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: process.env.SQL_PASS,
  DB: "redditDB",
};
