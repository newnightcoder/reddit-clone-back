import express from "express";
import mysql from "mysql2";
import { dbConfig } from "./DB/db.config.js";
import SQLconnexion from "./DB/db.connexion.js";

const app = express();
const PORT = 3001;

const db = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
  SQLconnexion;
});

app.get("/", (req, res) => {
  const test = "SHOW reddit";
  db.query(test, (err, result) => {
    if (err) {
      console.log("erreur test:", err);
    } else {
      console.log(result);
      res.send("hey hey");
    }
  });
});
