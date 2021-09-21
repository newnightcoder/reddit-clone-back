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
        errorMsg: `Oops! petit bug de notre part, désolé. \nVeuillez rafraichir la page et recommencer!`,
      });
      return;
    }
    const CREATE_USER = `
    INSERT INTO tbl_user (email, password) 
    VALUES (${user.email}, ${user.password})`;

    connection.query(CREATE_USER, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        const errorMsg =
          'Un compte avec cette adresse email existe déjà!\nSi vous êtes déjà membre, cliquez sur\n"se connecter" en bas de l\'écran.';
        res.status(500).json({
          errorNumber: err.errno === 1062 && err.errno,
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
        errorMsg: `Oops! petit bug de notre part, désolé. \nVeuillez rafraichir la page et recommencer!`,
      });
      return;
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
        const errorMsg =
          "Ce nom d'utilisateur est déjà pris...\nVeuillez en choisir un autre.";
        res.status(500).json({
          errorNumber: err.errno === 1062 && err.errno,
          errorMsg: err.errno === 1062 ? errorMsg : err.message,
        });
        return;
      }
      res.status(200).json({ message: "username added successfully!" });
      next();
    });
  });
};

export const addUserPic = (req, res, next) => {
  console.log("file sent from front:", req.file);
  console.log("params:", req.body);

  // ❗️❗️❗️ save in SQL DB!!!!
  db.getConnection((err, connection) => {
    connection.release();
    if (err) {
      console.log(err.message);
      return;
    }
    const ADD_USERPIC = `UPDATE tbl_user
    SET picUrl = ${JSON.stringify(`http://localhost:3001/${req.file.path}`)}
    WHERE id = ${req.body.userId}`;

    connection.query(ADD_USERPIC, (err, result, fields) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("result pic q1", result);
      console.log("fields pic q1", fields);
    });

    const GET_USERPIC = `SELECT picUrl FROM tbl_user WHERE id = ${req.body.userId}`;
    connection.query(GET_USERPIC, (err, result, fields) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("image address:", result[0].picUrl);
      console.log("fields pic q2", fields);
      res.status(200).json({
        picUrl: result[0].picUrl,
      });
      next();
    });
  });
};
