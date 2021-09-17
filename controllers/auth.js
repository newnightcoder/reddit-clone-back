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

    const CREATE_USER = `INSERT INTO tbl_user (email, password) VALUES (${user.email}, ${user.password}) `;

    connection.query(CREATE_USER, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        res.status(500).json({ errorMsg: err.message });
        throw err;
      }
      console.log("SQL query result:", result);
      console.log("SQL query fields:", fields);
      res.status(201).json({ message: "user added to DB!" });
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
      console.log("SQL query result:", result);
      console.log("SQL query fields:", fields);
      res.status(200).json({ message: "user in the DB! all good!" });
      next();
    });
  });
};
