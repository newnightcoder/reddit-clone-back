import { db } from "../db/db.config.js";
import { Post } from "../models/postModel.js";
/////////////////////////////
// GET ALL POSTS (FOR FEED)
/////////////////////////////

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.getPosts();
    const likes = await Post.getLikes();
    res.status(200).json({
      posts,
      likes,
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

export const likePost = async (req, res, next) => {
  const { userId, postId, like } = req.body;
  console.log("req.body", req.body);

  switch (like) {
    case false:
      const LIKE_POST = `INSERT INTO tbl_like (fk_postId_like, fk_userId_like) VALUES ((SELECT postId FROM tbl_post WHERE postId=${postId}), (SELECT id FROM tbl_user WHERE id=${userId}))`;
      try {
        const result = await db.query(LIKE_POST);
        console.log("result!!", result);
        res.status(200).json({ liked: true });
      } catch (error) {
        res.status(500).json({ error: "Oops petit problème de réseau..." });
        console.log(error);
      }
      break;
    case true:
      const DISLIKE_POST = `DELETE FROM tbl_like WHERE fk_postId_like= ${postId} AND fk_userId_like = ${userId}`;
      try {
        const result = await db.query(DISLIKE_POST);
        console.log("result dislike!!", result);
        res.status(200).json({ liked: false });
      } catch (error) {
        res.status(500).json({ error: "Oops petit problème de réseau..." });
        console.log(error);
      }
      break;
    default:
      return;
  }
};
