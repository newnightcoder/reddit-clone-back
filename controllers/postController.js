import { db } from "../DB/db.config.js";

/////////////////////////////
// GET ALL POSTS (FOR FEED)
/////////////////////////////

export const getPosts = async (req, res, next) => {
  const GET_POSTS = `SELECT title, postId, text, date, fk_userId_post, username, picUrl FROM tbl_post, tbl_user WHERE tbl_post.fk_userId_post=tbl_user.id`;

  const [posts, _] = await db.execute(GET_POSTS);

  const postsInOrder = posts.sort((a, b) => {
    if (a.postId < b.postId) return 1;
    else return -1;
  });
  console.log(postsInOrder);
  res.status(200).json({
    posts: postsInOrder,
  });
  next();
};

////////////////////
// SAVE POST IN DB
////////////////////

export const createPost = (req, res, next) => {
  const post = {
    title: JSON.stringify(req.body.title),
    text: JSON.stringify(req.body.text),
    userId: req.body.userId,
    date: JSON.stringify(req.body.date),
  };

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err.message);
      return;
    }

    const CREATE_POST = `INSERT INTO tbl_post (title, text, fk_userId_post, date) VALUES (${post.title}, ${post.text},${post.userId},${post.date})`;
    const GET_POST = `SELECT tbl_post.title, postId, text, date, fk_userId_post, username, picUrl FROM tbl_post, tbl_user WHERE tbl_post.fk_userId_post=tbl_user.id`;

    connection.query(CREATE_POST, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err.message);
        res.status(500).json({ errorMsg: "oops petit problèmepool!" });
        return;
      }
      console.log("result:", result.insertId);
      res.status(201).json({
        message: "post créé et sauvé dans la DB!👍🏾",
        // postId: result.insertId,
      });
      next();
    });
  });
};

///////////////
//   LIKE
///////////////

export const likePost = (req, res, next) => {
  const { postId, userId } = req.body;
  console.log(req.body);
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "oops something went wrong" });
      return;
    }

    const LIKE_POST = `INSERT INTO tbl_like (fk_postId_like, fk_userId_like) VALUES (${postId},${userId})`;
    connection.query(LIKE_POST, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        res.status(500).json({ error: "oops something went wrong" });
        return;
      }
      console.log("result!!", result);
      res.status(200).json({
        message: "liked!",
      });
      next();
    });
  });
};

///////////////
//   DISLIKE
///////////////

export const dislikePost = (req, res, next) => {
  const { postId, userId } = req.body;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "oops petit problème désolé" });
      return;
    }

    const DISLIKE_POST = `DELETE FROM tbl_like WHERE fk_postId_like= ${postId} AND fk_userId_like = ${userId}`;
    connection.query(DISLIKE_POST, (err, result, fields) => {
      connection.release();
      if (err) {
        console.log(err);
        res.status(500).json({ error: "mince alors" });
        return;
      }
      res.status(200).json({ message: "disliked!" });
      next();
    });
  });
};
