import { db } from "../DB/db.config.js";

// SAVE POST IN DB
export const createPost = (req, res, next) => {
  const post = {
    title: JSON.stringify(req.body.title),
    text: JSON.stringify(req.body.text),
    userId: req.body.userId,
  };

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err.message);
      return;
    }

    const CREATE_POST = `INSERT INTO tbl_post (title, text, fk_userId_post) VALUES (${post.title}, ${post.text},${post.userId})`;

    connection.query(CREATE_POST, (err, result, fields) => {
      connection.release();

      if (err) {
        console.log(err.message);
        res.status(500).json({ errorMsg: "oops petit problème DB!" });
        return;
      }
      console.log("result:", result);
      console.log("fields:", fields);
      res.status(201).json({ message: "post créé et sauvé dans la DB!👍🏾" });
      next();
    });
  });
};

// RETRIEVE POST FROM DB (TO DISPLAY IN FEED)
const getPost = () => {
  db.getConnection((err, connection) => {
    if (err) {
      console.log(err.message);
      return;
    }

    const GET_POST = ``;

    connection.query(GET_POST, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err.message);
        res.status(500).json({
          errorMsg: "oops petit problème de GET niveau DB!",
        });
        return;
      }
      console.log("result:", result);
      console.log("fields:", fields);
      res.status(200).json({
        title,
        text,
        fk_userId_post,
      });
      next();
    });
  });
};
