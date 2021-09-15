import express from "express";
import { db } from "./DB/db.config.js";

const app = express();
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
});

app.get("/", (req, res) => {
  const testQuery = "USE redditDB";
  db.getConnection((err, connexion) => {
    if (err) {
      console.log(err.message);
      return;
    }
    console.log("connexion launched!");
    connexion.query(testQuery, (err, result, fields) => {
      connexion.release();
      if (err) {
        console.log("erreur test:", err);
        return;
      }
      console.log("result!:", result);
      console.log("fields!:", fields);
      res.send("working like a charm!");
    });
  });
});
