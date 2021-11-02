import { db } from "../db/db.config.js";
import { Post } from "../models/postModel.js";

///////////////////
// GET ALL POSTS
///////////////////

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
export const getUserPosts = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const posts = await Post.getUserPosts(userId);
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

///////////////////
//  CREATE POST
///////////////////

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

///////////////////
//  EDIT POST
///////////////////

export const editPost = async (req, res, next) => {
  const { postId, userId, title, text } = req.body;
  const sqlEditPost = `UPDATE tbl_post SET title = "${title}", text = "${text}" WHERE postId="${postId}"`;
  const errorDB = "Oops désolé, petit problème de post...";
  try {
    const [res, _] = await db.execute(sqlEditPost);
    // const { insertId } = res;
    // return insertId;
    console.log("edit result", res);
  } catch (error) {
    throw error;
  }
};

///////////////////
//  DELETE POST
///////////////////

export const deletePost = async (req, res, next) => {
  const { postId } = req.body;
  const sql_deletePost = `DELETE FROM tbl_post WHERE postId=${postId}`;
  try {
    const result = await db.execute(sql_deletePost);
    if (result) {
      console.log("result delete", result);
      res
        .status(200)
        .json({ error: "oops petit problème lors de la suppression du post" });
    }
  } catch (error) {
    throw error;
  }
};

////////////////////
//  LIKE / UNLIKE
////////////////////

export const likePost = async (req, res, next) => {
  const { userId, postId, like } = req.body;
  const sql_LikePost = `INSERT INTO tbl_like (fk_postId_like, fk_userId_like) VALUES ((SELECT postId FROM tbl_post WHERE postId=${postId}), (SELECT id FROM tbl_user WHERE id=${userId}))`;
  const sql_DislikePost = `DELETE FROM tbl_like WHERE fk_postId_like= ${postId} AND fk_userId_like = ${userId}`;
  const sql_IncreaseLikesCount = `UPDATE tbl_post  SET likesCount = likesCount+1 WHERE postId=${postId}`;
  const sql_DecreseLikesCount = `UPDATE tbl_post  SET likesCount = likesCount-1 WHERE postId=${postId}`;
  const sql_getUpdatedCount = `SELECT likesCount FROM tbl_post WHERE postId=${postId}`;
  switch (like) {
    case false:
      try {
        await db.query(sql_LikePost);
        const result = await db.query(sql_IncreaseLikesCount);
        if (result) {
          const [updatedCount, _] = await db.query(sql_getUpdatedCount);
          console.log(updatedCount[0].likesCount);
          res
            .status(200)
            .json({ liked: true, count: updatedCount[0].likesCount });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Oops petit problème de réseau..." });
      }
      break;
    case true:
      try {
        await db.query(sql_DislikePost);
        const result = await db.query(sql_DecreseLikesCount);
        if (result) {
          const [updatedCount, _] = await db.query(sql_getUpdatedCount);
          res
            .status(200)
            .json({ liked: false, count: updatedCount[0].likesCount });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Oops petit problème de réseau..." });
      }
      break;
    default:
      return;
  }
};

////////////////////
//  COMMENT
////////////////////

export const createComment = async (req, res) => {
  const { userId, postId, text, date } = req.body;
  const sql_createComment = `INSERT INTO tbl_comments (fk_userId_comment, fk_postId_comment, text, date) VALUES (${userId},${postId},"${text}","${date}")`;
  const sql_increaseCommentCount = `UPDATE tbl_post SET commentCount = commentCount+1 WHERE postId=${postId}`;
  const sql_getCommentCount = `SELECT commentCount FROM tbl_post WHERE postId = ${postId} `;
  try {
    await db.execute(sql_createComment);

    const updatedCount = await db.execute(sql_increaseCommentCount);
    if (updatedCount) {
      const [count, _] = await db.execute(sql_getCommentCount);
      console.log(count[0].commentCount);
      res.status(201).json({ count: count[0].commentCount });
    }
  } catch (error) {
    throw error;
  }
};

export const getComments = async (req, res, next) => {
  const sql_getComments = `SELECT commentId, fk_postId_comment, fk_UserId_comment, text, date, username, picUrl FROM tbl_comments, tbl_user WHERE tbl_comments.fk_userId_comment=tbl_user.id`;
  try {
    const [comments, _] = await db.execute(sql_getComments);
    res.status(200).json({ comments });
  } catch (err) {
    throw err;
  }
};

////////////////////
//  REPLY TO COMMENT
////////////////////

export const createReply = async (req, res, next) => {
  const { commentId, userId, text, date } = req.body;
  const sql_createReply = `INSERT INTO tbl_replies (fk_commentId, fk_userId, text, date) VALUES (${commentId},${userId},"${text}","${date}")`;

  try {
    const result = await db.execute(sql_createReply);
    console.log(result);
    res.status(201);
  } catch (error) {
    throw error;
  }
};

export const getReplies = async (req, res, next) => {
  const sql_getReplies = `SELECT replyId, fk_commentId, fk_UserId, text, date, username, picUrl FROM tbl_replies, tbl_user WHERE tbl_replies.fk_userId=tbl_user.id`;
  try {
    const [replies, _] = await db.execute(sql_getReplies);
    console.log(replies);
    res.status(200).json({ replies });
  } catch (error) {
    throw error;
  }
};
