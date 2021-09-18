import { db } from "../DB/db.config.js";

export const createUser = (req, res, next) => {
  console.log("sent by frontend", req.body);

  const user = {
    email: JSON.stringify(req.body.newUserEmail),
    password: JSON.stringify(req.body.newUserPass),
  };

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        errorMsg: `Oops! petit bug désolé. Veuillez rafraichir la page et recommencer!`,
      });
      throw err;
    }

    const CREATE_USER = `
    INSERT INTO tbl_user (email, password) 
    VALUES (${user.email}, ${user.password})`;

    connection.query(CREATE_USER, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        const errorMsg = `Un compte avec cette adresse email existe déjà!\nSi vous êtes déjà membre, cliquez sur "se connecter" en bas de l'écran.`;
        res.status(500).json({
          errorMsg: err.errno === 1062 ? errorMsg : err.message,
        });
        return;
      }
      console.log("SQL query result:", result.insertId);
      console.log("SQL query fields:", fields);
      res.status(201).json({
        message: "user added to DB!",
        userId: result.insertId,
      });
      next();
    });
  });
};

export const logUser = (req, res, next) => {
  console.log("sent by frontend", req.body);

  const user = {
    email: JSON.stringify(req.body.userEmail),
    password: JSON.stringify(req.body.userPass),
  };

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        errorMsg:
          "Oops! petit bug désolé. Veuillez rafraichir la page et recommencer!",
      });
      throw err;
    }

    const FIND_USER = `SELECT * FROM tbl_user WHERE email = ${user.email}`;

    connection.query(FIND_USER, (err, result, fields) => {
      connection.release();

      console.log("SQL query result:", result);

      if (err) {
        console.log(err);
        res.status(404).json({
          errorMsg: "Oops petite erreur serveur! Veuillez recommencer!",
        });
        return;
      } else if (result.length === 0) {
        res
          .status(404)
          .json({ errorMsg: "Pas de compte trouvé avec ces identifiants!" });
        return;
      }
      res.status(200).json({ message: "user in the DB! all good!" });
      next();

      // WITH SWITCH STATEMENT?
      // switch ((err, result, fields)) {
      //   case err:
      //     res.status(404).json({
      //       errorMsg: "Oops petite erreur serveur! Veuillez recommencer!",
      //     });
      //     break;
      //   case result.length === 0:
      //     res
      //       .status(404)
      //       .json({ errorMsg: "Pas de compte trouvé avec ces identifiants!" });
      //     break;
      //   default:
      //     console.log("SQL query result:", result);
      //     console.log("SQL query fields:", fields);
      //     res.status(200).json({ message: "user in the DB! all good!" });
      //     next();
      //     break;
      // }
    });
  });
};

export const addUserName = (req, res, next) => {
  console.log("new username received!", req.body.userName);
  console.log("id received!", typeof req.body.userId);

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        errorMsg:
          "Oops! petit problème de connexion. \n Veuillez rafraichir la page et recommencer.",
      });
      return;
    }
    const ADD_USERNAME = `
    UPDATE tbl_user
    SET username = ${JSON.stringify(req.body.userName)}
    WHERE id = ${req.body.userId}
    `;
    connection.query(ADD_USERNAME, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        res.status(500).json({ errorMsg: err.message });
        return;
      }
      res.status(200).json({ message: "username added successfully!" });
      next();
    });
  });
};
