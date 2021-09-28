import { db } from "../DB/db.config.js";

// SAVE POST IN DB
export const createPost = (req, res, next) => {
  const post = {
    title: JSON.stringify(req.body.title),
    text: JSON.stringify(req.body.text),
    userId: req.body.userId,
    date: JSON.stringify(req.body.date),
  };

  db.getConnection((err, connection) => {
    if (err) {
      console.log(err.message);
      return;
    }

    const CREATE_POST = `INSERT INTO tbl_post (title, text, fk_userId_post, date) VALUES (${post.title}, ${post.text},${post.userId},${post.date})`;

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

// RETRIEVE POSTS FROM DB (TO DISPLAY IN FEED)
export const getPosts = (req, res, next) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.log(err.message);
      return;
    }

    const GET_POST = `SELECT tbl_post.title, postId, text, date, fk_userId_post, username, picUrl FROM tbl_post, tbl_user WHERE tbl_post.fk_userId_post=tbl_user.id`;

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
      const postsInOrder = result.sort((a, b) => {
        if (a.postId < b.postId) return 1;
        else return -1;
      });
      res.status(200).json({
        posts: postsInOrder,
      });
      next();
    });
  });
};
