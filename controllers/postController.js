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
    if (posts && likes) res.status(200).json({ posts, likes });
  } catch (err) {
    res.status(500).json({ error: "database" });
  }
};

///////////////////
// GET POST BY ID
///////////////////
export const getPostById = async (req, res, next) => {
  console.log("REQ received for post by id");
  const { id } = req.params;
  const sqlGetPostById = `SELECT * , (SELECT username FROM tbl_user WHERE id=tbl_post.fk_userId_post) as username FROM tbl_post WHERE postId=?`;
  try {
    const [post, _] = await db.execute(sqlGetPostById, [id]);
    // console.log("post from db", post[0]);
    if (post) return res.status(200).json({ currentPost: post[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "database" });
  }
};

///////////////////
// GET ALL LIKES
///////////////////

export const getLikes = async (req, res) => {
  try {
    const likes = await Post.getLikes();
    if (likes) return res.status(200).json({ likes });
  } catch (err) {
    return res.status(500).json({ error: "database" });
  }
};

/////////////////////////////
// GET ALL POSTS FROM A USER
/////////////////////////////

export const getUserPosts = async (req, res) => {
  const { userId } = req.body;
  try {
    const posts = await Post.getUserPosts(userId);
    const likes = await Post.getLikes();
    if (posts && likes)
      return res.status(200).json({
        posts,
        likes,
      });
  } catch (err) {
    return res.status(500).json({ error: "database" });
  }
};

///////////////////
//  SAVE POST IMG
///////////////////

export const savePostImg = (req, res) => {
  const fileLocation = req.file.location;
  try {
    if (fileLocation) return res.status(201).json({ imgUrl: fileLocation });
  } catch (err) {
    res.status(500).json({ error: "database" });
  }
};
///////////////////
//  CREATE POST
///////////////////

export const createPost = async (req, res) => {
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
  try {
    const newPost = await post.create();
    if (newPost) return res.status(201).json({ newPost });
  } catch (err) {
    res.status(500).json({ error: "database" });
  }
};

///////////////////
//  EDIT POST
///////////////////

export const editPost = async (req, res) => {
  const { origin, id, title, text, imgUrl, isPreview, preview } = req.body;
  console.log(origin, id, title, text, imgUrl, isPreview, preview);
  const sqlEditPost = `UPDATE tbl_post SET title = "${title}", text = "${text}", imgUrl="${imgUrl}", isPreview="${isPreview}", previewTitle="${
    isPreview === 1 ? preview.title : ""
  }", previewText="${
    isPreview === 1 && preview.description !== null
      ? preview.description.substr(0, 100)
      : ""
  }", previewImg="${isPreview === 1 ? preview.image : ""}", previewPub="${
    isPreview === 1 && preview.publisher !== null ? preview.publisher : ""
  }", previewUrl="${isPreview === 1 ? preview.url : ""}", previewPubLogo="${
    isPreview === 1 && preview.logo !== null ? preview.logo : ""
  }"   WHERE postId=${id}`;
  const sqlEditComment = `UPDATE tbl_comments SET text = "${text}" WHERE commentId=${id}`;
  const sqlEditReply = `UPDATE tbl_replies SET text = "${text}" WHERE replyId=${id}`;

  const sqlGetEditedPost = `SELECT title, text, date, imgUrl, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo FROM tbl_post WHERE postId=?`;
  const sqlGetEditedComment = `SELECT text FROM tbl_comments WHERE commentId=?`;
  const sqlGetEditedReply = `SELECT text FROM tbl_replies WHERE replyId=?`;

  try {
    switch (origin) {
      case "post": {
        const res0 = await db.execute(sqlEditPost);
        const [edit, _] = await db.execute(sqlGetEditedPost, [id]);
        if (res0 && edit) return res.status(200).json({ edit: edit[0] });
      }

      case "comment": {
        const res2 = await db.execute(sqlEditComment);
        const [edit, _] = await db.execute(sqlGetEditedComment, [id]);
        if (res2 && edit) return res.status(200).json({ edit: edit[0] });
      }
      case "reply": {
        const res4 = await db.execute(sqlEditReply);
        const [edit, _] = await db.execute(sqlGetEditedReply, [id]);
        if (res4 && edit) return res.status(200).json({ edit: edit[0] });
      }
      default:
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "database" });
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
    switch (origin) {
      case "post":
        const res0 = await db.execute(sql_deletePost);
        if (res0) return res.status(200).json({ msg: "post deleted" });
      case "comment":
        const res1 = await db.execute(sql_decreaseCommentCount);
        const res2 = await db.execute(sql_deleteComment);
        if (res1 && res2)
          return res.status(200).json({ msg: "comment deleted" });
      case "reply":
        const res3 = await db.execute(sql_deleteReply);
        if (res3) return res.status(200).json({ msg: "reply deleted" });
      default:
    }
  } catch (err) {
    return res.status(500).json({ error: "database" });
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
    const comment = await db.execute(sql_createComment);
    const updatedCount = await db.execute(sql_increaseCommentCount);
    if (comment && updatedCount) {
      const [count, _] = await db.execute(sql_getCommentCount);
      console.log(count[0].commentCount);
      res.status(201).json({ count: count[0].commentCount });
    }
  } catch (err) {
    return res.status(500).json({ error: "database" });
  }
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const sql_getComments = `SELECT commentId, fk_postId_comment, fk_userId_comment, text, date, likesCount, (SELECT username FROM tbl_user WHERE tbl_user.id=tbl_comments.fk_userId_comment) as username,  (SELECT picUrl FROM tbl_user WHERE tbl_user.id = tbl_comments.fk_userId_comment) as picUrl FROM tbl_comments WHERE tbl_comments.fk_postId_comment=?`;
  try {
    const [comments, _] = await db.execute(sql_getComments, [postId]);
    if (comments) return res.status(200).json({ comments });
  } catch (err) {
    console.log("erreur", err);
    return res.status(500).json({ error: "database" });
  }
};

////////////////////
// REPLY TO COMMENT
////////////////////

export const createReply = async (req, res, next) => {
  const { userId, commentId, text, date } = req.body;
  const sql_createReply = `INSERT INTO tbl_replies (fk_commentId, fk_userId_reply, text, date) VALUES (?,?,"?","?")`;
  try {
    const result = await db.execute(sql_createReply, [
      commentId,
      userId,
      text,
      date,
    ]);
    if (result) {
      console.log("RESULT CREATE REPLY:", result);
      res.status(201).json({ replyId: result[0].insertId });
    }
  } catch (err) {
    res.status(500).json({ error: "database" });
  }
};

export const getReplies = async (req, res) => {
  const { arr } = req.params;
  // console.log(`${typeof arr}\n_____________________________________`);
  const idArr = arr.split(",");
  // console.log(
  //   `ARRAY OF NUMBERS/ ${typeof +idArr[0]}\n_____________________________________`
  // );
  // res.status(200).json({ replies: +idArr[0] });
  const sql_getReplies = `SELECT replyId, fk_commentId, fk_userId_reply, text, date, likesCount, (SELECT username FROM tbl_user WHERE tbl_user.id=tbl_replies.fk_userId_reply) as username,  (SELECT picUrl FROM tbl_user WHERE tbl_user.id = tbl_replies.fk_userId_reply) as picUrl FROM tbl_replies WHERE tbl_replies.fk_commentId=?`;
  const replies = [];
  try {
    for (let index of idArr) {
      let [res, _] = await db.execute(sql_getReplies, [+index]);
      if (res.length > 0) {
        res.forEach((i) => replies.push(i));
      }
    }
    // const [replies, _] = await db.execute(sql_getReplies, [commentId]);
    if (replies) {
      console.log("REPLIES", replies.length, replies);
      return res.status(200).json({ replies });
    }
  } catch (err) {
    return res.status(500).json({ error: "database" });
  }
};

////////////////////
// PREVIEWLINK DATA
////////////////////

export const sendLinkData = async (req, res) => {
  const { targetUrl } = req.body;
  try {
    let { article, error } = await scrape(targetUrl);
    if (error) return res.status(500).json({ error });
    if (article) {
      console.log("SCRAPED ARTICLE:", article);
      if (article.publisher?.includes(">")) {
        article = { ...article, publisher: null };
      }
      if (article.description?.includes(">")) {
        article = { ...article, description: null };
      }
      res.status(200).json({ article });
    }
  } catch (err) {
    console.log("ERREUR SENDLINKDATA:", err);
    res.status(500).json({ error: "database" });
  }
};
