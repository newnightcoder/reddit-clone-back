import { db } from "../DB/db.config.js";
import { Post } from "../models/postModel.js";

///////////////////
// GET ALL POSTS
///////////////////
const imgUrlHost =
  process.env.NODE_ENV === "production"
    ? "https://social-media-sql-backend.herokuapp.com"
    : "http://localhost:3001";

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

///////////////////
// GET ALL LIKES
///////////////////

export const getLikes = async (req, res, next) => {
  try {
    const likes = await Post.getLikes();
    res.status(200).json({
      likes,
    });
    next();
  } catch (error) {
    console.log(error);
  }
};

/////////////////////////////
// GET ALL POSTS FROM A USER
/////////////////////////////

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
// GET ALL USERS
///////////////////

export const getUsers = async (req, res, next) => {
  const sql_getAllUsers = `SELECT id, username, picUrl, creationDate,role FROM tbl_user`;
  try {
    const [users, _] = await db.execute(sql_getAllUsers);
    if (users) {
      res.status(200).json({ users });
    }
  } catch (error) {
    throw error;
  }
};

///////////////////
//  SAVE POST IMG
///////////////////

export const savePostImg = (req, res, next) => {
  const { path } = req.file;

  const errorServer = "Oops désolé, petit problème de post...";
  console.log("path", path);
  try {
    res.status(201).json({ imgUrl: `${imgUrlHost}/${path}` });
    next();
  } catch (err) {
    res.status(500).json({ error: errorServer });
  }
};
///////////////////
//  CREATE POST
///////////////////

export const createPost = async (req, res, next) => {
  const { userId, title, text, date, imgUrl } = req.body;
  const post = new Post(null, userId, title, text, date, imgUrl, 0);
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
  const { origin, id, title, text, imgUrl } = req.body;
  console.log(origin, id, title, text, imgUrl);
  const sqlEditPost = `UPDATE tbl_post SET title = "${title}", text = "${text}",imgUrl="${imgUrl}" WHERE postId=${id}`;
  const sqlEditComment = `UPDATE tbl_comments SET text = "${text}" WHERE commentId=${id}`;
  const sqlEditReply = `UPDATE tbl_replies SET text = "${text}" WHERE replyId=${id}`;
  const errorDB = "Oops désolé, petit problème de post...";
  try {
    const [res, _] = await db.execute(
      origin === "post"
        ? sqlEditPost
        : origin === "comment"
        ? sqlEditComment
        : origin === "reply"
        ? sqlEditReply
        : null
    );
    console.log("edit result", res);
  } catch (error) {
    res.status(500).json({ error: errorDB });
  }
};

///////////////////
//  DELETE POST
///////////////////

export const deletePost = async (req, res, next) => {
  const { postId, origin, postIdComment } = req.body;
  const sql_deletePost = `DELETE FROM tbl_post WHERE postId=${postId}`;
  const sql_deleteComment = `DELETE FROM tbl_comments WHERE commentId=${postId}`;
  const sql_decreaseCommentCount = `UPDATE tbl_post SET commentCount= commentCount-1 WHERE postId=${postIdComment}`;
  const sql_deleteReply = `DELETE FROM tbl_replies WHERE replyId=${postId}`;
  try {
    if (origin === "comment") {
      await db.execute(sql_decreaseCommentCount);
    }
    const result = await db.execute(
      origin === "post"
        ? sql_deletePost
        : origin === "comment"
        ? sql_deleteComment
        : origin === "reply" && sql_deleteReply
    );
    if (result) {
      console.log("result delete", result);
      return res
        .status(200)
        .json({ error: "oops petit problème lors de la suppression du post" });
    }
  } catch (error) {
    console.log(error);
  }
};

////////////////////
//  LIKE / UNLIKE
////////////////////

export const likePost = async (req, res, next) => {
  const { origin, userId, id, like } = req.body;
  const sql_LikePost = `INSERT INTO tbl_like (fk_postId_like, fk_userId_like) 
  VALUES ((SELECT postId FROM tbl_post WHERE postId=${id}), 
  (SELECT id FROM tbl_user WHERE id=${userId}))`;
  const sql_LikeComment = `INSERT INTO tbl_like (fk_commentId_like, fk_userId_like) 
  VALUES ((SELECT commentId FROM tbl_comments WHERE commentId=${id}), (SELECT id FROM tbl_user WHERE id=${userId}))`;
  const sql_LikeReply = `INSERT INTO tbl_like (fk_replyId_like, fk_userId_like) VALUES ((SELECT replyId FROM tbl_replies WHERE replyId=${id}), (SELECT id FROM tbl_user WHERE id=${userId}))`;
  const sql_DislikePost = `DELETE FROM tbl_like WHERE fk_postId_like= ${id} AND fk_userId_like = ${userId}`;
  const sql_DislikeComment = `DELETE FROM tbl_like WHERE fk_commentId_like= ${id} AND fk_userId_like = ${userId}`;
  const sql_DislikeReply = `DELETE FROM tbl_like WHERE fk_replyId_like= ${id} AND fk_userId_like = ${userId}`;
  const sql_IncreaseLikesCountPost = `UPDATE tbl_post  SET likesCount = likesCount+1 WHERE postId=${id}`;
  const sql_IncreaseLikesCountComment = `UPDATE tbl_comments  SET likesCount = likesCount+1 WHERE commentId=${id}`;
  const sql_IncreaseLikesCountReply = `UPDATE tbl_replies  SET likesCount = likesCount+1 WHERE replyId=${id}`;
  const sql_DecreseLikesCountPost = `UPDATE tbl_post  SET likesCount = likesCount-1 WHERE postId=${id}`;
  const sql_DecreseLikesCountComment = `UPDATE tbl_comments  SET likesCount = likesCount-1 WHERE commentId=${id}`;
  const sql_DecreseLikesCountReply = `UPDATE tbl_replies  SET likesCount = likesCount-1 WHERE replyId=${id}`;
  switch (like) {
    case false:
      try {
        const result_1 = await db.query(
          origin === "post"
            ? sql_LikePost
            : origin === "comment"
            ? sql_LikeComment
            : origin === "reply" && sql_LikeReply
        );
        const result_2 = await db.query(
          origin === "post"
            ? sql_IncreaseLikesCountPost
            : origin === "comment"
            ? sql_IncreaseLikesCountComment
            : origin === "reply" && sql_IncreaseLikesCountReply
        );
        if (result_1 && result_2) {
          console.log("like result1", result_1, "like result2", result_2);
          res.status(200).json({ liked: true });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Oops petit problème de réseau..." });
      }
      break;
    case true:
      try {
        const result_1 = await db.query(
          origin === "post"
            ? sql_DislikePost
            : origin === "comment"
            ? sql_DislikeComment
            : origin === "reply" && sql_DislikeReply
        );
        const result_2 = await db.query(
          origin === "post"
            ? sql_DecreseLikesCountPost
            : origin === "comment"
            ? sql_DecreseLikesCountComment
            : origin === "reply" && sql_DecreseLikesCountReply
        );
        if (result_1 && result_2) {
          console.log("dislike result1", result_1, "dislike result2", result_2);

          res.status(200).json({ liked: false });
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
  const sql_getComments = `SELECT commentId, fk_postId_comment, fk_userId_comment, text, date, likesCount, username, picUrl FROM tbl_comments, tbl_user WHERE tbl_comments.fk_userId_comment=tbl_user.id`;
  try {
    const [comments, _] = await db.execute(sql_getComments);
    res.status(200).json({ comments });
  } catch (err) {
    throw err;
  }
};

////////////////////
// REPLY TO COMMENT
////////////////////

export const createReply = async (req, res, next) => {
  const { commentId, userId, text, date } = req.body;
  const sql_createReply = `INSERT INTO tbl_replies (fk_commentId, fk_userId_reply, text, date) VALUES (${commentId},${userId},"${text}","${date}")`;

  try {
    const result = await db.execute(sql_createReply);
    console.log(result);
    res.status(201);
  } catch (error) {
    throw error;
  }
};

export const getReplies = async (req, res, next) => {
  const sql_getReplies = `SELECT replyId, fk_commentId, fk_userId_reply, text, date, likesCount, username, picUrl FROM tbl_replies, tbl_user WHERE tbl_replies.fk_userId_reply=tbl_user.id`;
  try {
    const [replies, _] = await db.execute(sql_getReplies);
    console.log(replies);
    res.status(200).json({ replies });
  } catch (error) {
    throw error;
  }
};
