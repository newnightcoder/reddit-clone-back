import { db } from "../DB/db.config.js";
import { User } from "../models/userModel.js";

//////////////////////
// LOG EXISTING USER
//////////////////////

export const logUser = async (req, res, next) => {
  const { email, password } = req.body;
  const errorBackend = "Oops! petit problème de notre part désolé";
  const errorNotFound = "Aucun compte trouvé avec ces identifiants";
  try {
    const user = await new User(null, email, password).login();
    if (user === undefined) {
      return res.status(404).json({ error: errorNotFound });
    }
    res.status(200).json({ user, isNewUser: false });
    next();
  } catch (error) {
    res.status(500).json({ error: errorBackend });
  }
};

////////////////////////////
// CREATE NEW USER STEP 1
/////////////////////////////

export const createUser = async (req, res, next) => {
  const { email, password } = req.body;
  const errorBackend = "Oops! petit problème de notre part désolé";
  const errorDuplicate = "Un compte associé à cet email existe déjà.";
  const user = new User(null, email, password);
  try {
    const userId = await user.create();
    res.status(201).json({ userId });
  } catch (error) {
    console.log(error);
    const { errno } = error;
    res
      .status(500)
      .json({ error: errno === 1062 ? errorDuplicate : errorBackend });
  }
};

//////////////////////////////////////
// ADD USERNAME (CREATE USER STEP 2)
//////////////////////////////////////

export const addUserName = async (req, res, next) => {
  const { id, username, creationDate } = req.body;
  console.log("id:", id, "username:", username, "creationDate:", creationDate);
  const user = new User(id, null, null, username, null, creationDate);
  const errorBackend = "Oops! petit problème de notre part désolé";
  const errorDuplicate =
    "Ce nom d'utilisateur est déjà pris! Veuillez en choisir un autre.";
  try {
    const result = await user.addUsername();
    res.status(201).json({ result, isNewUser: true });
  } catch (error) {
    const { errno } = error;
    res.status(500).json({
      error: errno === 1062 ? errorDuplicate : errorBackend,
    });
  }

  // db.getConnection((err, connection) => {
  //   if (err) {
  //     console.log(err);
  //     res.status(500).json({
  //       error:
  //         "Oops! petit problème de connexion. \n Veuillez rafraichir la page et recommencer.",
  //     });
  //     return;
  //   }
  //   const ADD_USERNAME = `
  //   UPDATE tbl_user
  //   SET username = ${JSON.stringify(
  //     req.body.userName
  //   )}, creationDate = ${JSON.stringify(req.body.date)}
  //   WHERE id = ${req.body.id}
  //   `;
  //   connection.query(ADD_USERNAME, (err, result, fields) => {
  //     connection.release();
  //     if (err) {
  //       console.log(err);
  //       const error =
  //         "Ce nom d'utilisateur est déjà pris...\nVeuillez en choisir un autre.";
  //       res.status(500).json({
  //         errorNumber: err.errno === 1062 && err.errno,
  //         error: err.errno === 1062 ? error : err.message,
  //       });
  //       return;
  //     }
  //     console.log(result);
  //   });

  //   const GET_USERNAME = `SELECT username, email, creationDate FROM tbl_user WHERE id=${req.body.id} `;
  //   connection.query(GET_USERNAME, (err, result, fields) => {
  //     connection.release();
  //     if (err) {
  //       console.log(err);
  //       const error = err.message;
  //       res.status(500).json({
  //         errorNumber: err.errno === 1062 && err.errno,
  //         error: err.errno === 1062 ? error : err.message,
  //       });
  //       return;
  //     }
  //     res.status(200).json({
  //       successMsg: "username added successfully!",
  //       username: result[0].username,
  //       creationDate: result[0].creationDate,
  //       email: result[0].email,
  //       isNewUser: true,
  //     });
  //     next();
  //   });
  // });
};

/////////////////////////////////////
// ADD USER PIC (CREATE USER STEP 3)
/////////////////////////////////////

export const addUserPic = (req, res, next) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.log(err.message);
      res.status(500).json({ error: "ooops something went wrong sorry!" });
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
        res.status(500).json({ error: "petit bug désolé" });
        return;
      }
    });

    const GET_USERPIC = `SELECT picUrl FROM tbl_user WHERE id = ${req.body.userId}`;
    connection.query(GET_USERPIC, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        res.status(500).json({ error: "problème avec l'image" });
        return;
      }
      res.status(200).json({
        picUrl: result[0].picUrl,
      });
      next();
    });
  });
};
