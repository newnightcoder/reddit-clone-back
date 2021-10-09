import { Post } from "../models/postModel.js";

/////////////////////////////
// GET ALL POSTS (FOR FEED)
/////////////////////////////

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.getPosts();
    res.status(200).json({
      posts,
    });
    next();
  } catch (error) {
    console.log(error);
  }
};

////////////////////
// CREATE POST IN DB
////////////////////

export const createPost = async (req, res, next) => {
  const { userId, title, text, date } = req.body;
  const post = new Post(null, userId, title, text, date, 0);
  const errorDB = "Oops désolé, petit problème de post...";
  try {
    const postId = await post.create();
    res.status(201).json({ postId });
    next();
  } catch (err) {
    res.status(500).json({ error: errorDB });
  }
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
