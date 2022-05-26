import { db } from "../DB/db.config.js";
import { scrape } from "../middleware/metascraper.js";
import { Post } from "../models/postModel.js";

///////////////////
// GET ALL POSTS
///////////////////

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.getPosts();
    const likes = await Post.getLikes();
    res.status(200).json({ posts, likes });
    // next();
  } catch (error) {
    console.log(error);
  }
};

///////////////////
// GET POST BY ID
///////////////////
export const getPostById = async (req, res, next) => {
  console.log("REQ received for post by id");
  const { id } = req.params;
  const sqlGetPostById = `SELECT * , (SELECT username FROM tbl_user WHERE id=tbl_post.fk_userId_post) as username FROM tbl_post WHERE postId=${id}`;
  try {
    const [post, _] = await db.execute(sqlGetPostById, [id]);
    console.log("post from db", post[0]);
    res.status(200).json({ currentPost: post[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "backend" });
  }
};

///////////////////
// GET ALL LIKES
///////////////////

export const getLikes = async (req, res, next) => {
  try {
    const likes = await Post.getLikes();
    return res.status(200).json({ likes });
    // next();
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
// GET RECENT USERS
///////////////////

export const getRecentUsers = async (req, res, next) => {
  const sql_getAllUsers = `SELECT id, username, picUrl, creationDate,role FROM tbl_user`;
  try {
    const [users, _] = await db.execute(sql_getAllUsers);
    if (users) {
      const recentUsers = users
        .sort((a, b) => {
          if (a.id < b.id) return 1;
          if (a.id > b.id) return -1;
          return 0;
        })
        .splice(0, 5);
      // console.log(recentUsers);
      res.status(200).json({ recentUsers });
    }
  } catch (error) {
    throw error;
  }
};

export const getMods = async (req, res, next) => {
  const sql_getMods = `SELECT id, username, picUrl, creationDate, role FROM tbl_user WHERE role="admin";`;
  try {
    const [mods, _] = await db.execute(sql_getMods);
    // console.log(mods);
    res.status(200).json({ mods });
  } catch (error) {
    throw error;
  }
};

///////////////////
//  SAVE POST IMG
///////////////////

export const savePostImg = (req, res, next) => {
  const fileLocation = req.file.location;
  const errorServer = "Oops désolé, petit problème de post...";
  console.log("fileLocation", fileLocation);
  try {
    res.status(201).json({ imgUrl: fileLocation });
    next();
  } catch (err) {
    res.status(500).json({ error: errorServer });
  }
};
///////////////////
//  CREATE POST
///////////////////

export const createPost = async (req, res, next) => {
  const { userId, title, text, date, imgUrl, isPreview, preview } = req.body;
  const post = new Post(
    null,
    userId,
    title,
    text,
    date,
    imgUrl,
    0,
    isPreview,
    preview
  );
  const errorDB = "Oops désolé, petit problème de post...";
  try {
    const newPost = await post.create();
    res.status(201).json({ newPost });
    next();
  } catch (err) {
    res.status(500).json({ error: errorDB });
  }
};

///////////////////
//  EDIT POST
///////////////////

export const editPost = async (req, res, next) => {
  const { origin, id, title, text, imgUrl, isPreview, preview } = req.body;
  console.log(origin, id, title, text, imgUrl, isPreview, preview);
  const sqlEditPost = `UPDATE tbl_post SET title = "${title}", text = "${text}", imgUrl="${imgUrl}", isPreview="${isPreview}", previewTitle="${
    isPreview === 1 ? preview.title : ""
  }", previewText="${
    isPreview === 1 ? preview.description.substr(0, 100) : ""
  }", previewImg="${isPreview === 1 ? preview.image : ""}", previewPub="${
    isPreview === 1 && preview.publisher !== null ? preview.publisher : ""
  }", previewUrl="${isPreview === 1 ? preview.url : ""}", previewPubLogo="${
    isPreview === 1 && preview.logo !== null ? preview.logo : ""
  }"   WHERE postId=${id}`;
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
    console.log(error);
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
      return res
        .status(200)
        .json({ error: "oops petit problème lors de la suppression du post" });
    }
  } catch (error) {
    console.log(error);
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
    return res.status(200).json({ comments });
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
    // console.log(replies);
    return res.status(200).json({ replies });
  } catch (error) {
    throw error;
  }
};

////////////////////
// PREVIEWLINK DATA
////////////////////

export const sendLinkData = async (req, res) => {
  const { targetUrl } = req.body;
  let result = await scrape(targetUrl);
  if (result.publisher?.includes("/>")) {
    result = { ...result, publisher: null };
  }
  console.log(result);
  res.status(200).json({ result });
};
