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
      throw err;
    }

    const CREATE_USER = `INSERT INTO tbl_user (email, password) VALUES (${user.email}, ${user.password}) `;

    connection.query(CREATE_USER, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        throw err;
      }
      console.log("SQL query result:", result);
      console.log("SQL query fields:", fields);
      res.status(201).json({ message: "backend says hi" });
      next();
    });
  });
};
