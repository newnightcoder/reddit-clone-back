import mysql from "mysql2";
import { dbConfig } from "./db.config.js";

const SQLconnexion = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
});

SQLconnexion.connect((error) => {
  if (error) {
    console.log("erreur connexion", error.message);
  } else {
    console.log("connected to SQL DB!!!");
  }
});

export default SQLconnexion;
