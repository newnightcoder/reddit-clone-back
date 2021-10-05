import { db } from "../DB/db.config.js";

//////////////////////
// LOG EXISTING USER
//////////////////////

export const logUser = (req, res, next) => {
  console.log("sent by frontend", req.body);

  const user = {
    email: JSON.stringify(req.body.email),
    password: JSON.stringify(req.body.password),
  };

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: `Oops! petit bug de notre part, désolé. \nVeuillez rafraichir la page et recommencer!`,
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
          error: "Oops petite erreur serveur! Veuillez recommencer!",
        });
        return;
      } else if (result.length === 0) {
        res
          .status(404)
          .json({ error: "Pas de compte trouvé avec ces identifiants!" });
        return;
      }
      console.log("result user", result[0]);
      res.status(200).json({ user: result[0] });
      next();
    });
  });
};

////////////////////////////
// CREATE NEW USER STEP 1
/////////////////////////////
export const createUser = (req, res, next) => {
  const user = {
    email: JSON.stringify(req.body.email),
    password: JSON.stringify(req.body.password),
  };

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error: `Oops! petit bug de notre part, désolé. \nVeuillez rafraichir la page et recommencer!`,
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
        const error =
          'Un compte avec cette adresse email existe déjà!\nSi vous êtes déjà membre, cliquez sur\n"se connecter" en bas de l\'écran.';
        res.status(500).json({
          errorNumber: err.errno === 1062 && err.errno,
          error: err.errno === 1062 ? error : err.message,
        });
        return;
      }
      res.status(201).json({
        message: "user added to DB!",
        userId: result.insertId,
      });
      next();
    });
  });
};

//////////////////////////////////////
// ADD USERNAME (CREATE USER STEP 2)
//////////////////////////////////////

export const addUserName = (req, res, next) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        error:
          "Oops! petit problème de connexion. \n Veuillez rafraichir la page et recommencer.",
      });
      return;
    }
    const ADD_USERNAME = `
    UPDATE tbl_user
    SET username = ${JSON.stringify(
      req.body.userName
    )}, creationDate = ${JSON.stringify(req.body.date)}
    WHERE id = ${req.body.id}
    `;
    connection.query(ADD_USERNAME, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        const error =
          "Ce nom d'utilisateur est déjà pris...\nVeuillez en choisir un autre.";
        res.status(500).json({
          errorNumber: err.errno === 1062 && err.errno,
          error: err.errno === 1062 ? error : err.message,
        });
        return;
      }
      console.log(result);
    });

    const GET_USERNAME = `SELECT username, email, creationDate FROM tbl_user WHERE id=${req.body.id} `;
    connection.query(GET_USERNAME, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        const error = err.message;
        res.status(500).json({
          errorNumber: err.errno === 1062 && err.errno,
          error: err.errno === 1062 ? error : err.message,
        });
        return;
      }
      res.status(200).json({
        successMsg: "username added successfully!",
        username: result[0].username,
        creationDate: result[0].creationDate,
        email: result[0].email,
      });
      next();
    });
  });
};

/////////////////////////////////////
// ADD USER PIC (CREATE USER STEP 3)
/////////////////////////////////////

export const addUserPic = (req, res, next) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.log(err.message);
      return;
    }
    const ADD_USERPIC = `UPDATE tbl_user
    SET picUrl = ${JSON.stringify(
      `http://localhost:3001/${req.file.path}`
    )} WHERE id=${req.body.userId} `;

    connection.query(ADD_USERPIC, (err, result, fields) => {
      connection.release();

      if (err) {
        console.log(err);
        return;
      }
    });

    const GET_USERPIC = `SELECT picUrl FROM tbl_user WHERE id = ${req.body.userId}`;
    connection.query(GET_USERPIC, (err, result, fields) => {
      connection.release();

      if (err) {
        console.log(err);
        return;
      }

      res.status(200).json({
        picUrl: result[0].picUrl,
      });
      next();
    });
  });
};
