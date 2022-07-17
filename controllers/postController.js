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
    if (posts && likes) {
      res.status(200).json({ posts, likes });
    }
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
  const { post } = req.body;
  const {
    author: { id: userId },
    title,
    text,
    date,
    imgUrl,
    isPreview,
    preview,
  } = post;
  const newPost = new Post(
    userId,
    title,
    text,
    date,
    imgUrl,
    isPreview,
    preview
  );
  console.log("userId:", userId);
  try {
    const result = await newPost.create();
    if (result) return res.status(201).json({ newPost: result });
  } catch (err) {
    res.status(500).json({ error: "database" });
  }
};

///////////////////
//  EDIT POST
///////////////////

export const editPost = async (req, res) => {
  const {
    origin,
    post: { id, title, text, imgUrl, isPreview, preview },
  } = req.body;
  console.log(origin, id, title, text, imgUrl, isPreview, preview);
  const sqlEditPost = `UPDATE tbl_post SET title = "${title}", text = "${text}", imgUrl="${imgUrl}", isPreview=${
    isPreview ? 1 : 0
  }, previewTitle="${isPreview ? preview.title : ""}", previewText="${
    isPreview && preview.text !== null ? preview.text.substr(0, 100) : ""
  }", previewImg="${isPreview ? preview.image : ""}", previewPub="${
    isPreview && preview.publisher !== null ? preview.publisher : ""
  }", previewUrl="${isPreview ? preview.url : ""}", previewPubLogo="${
    isPreview && preview.logo !== null ? preview.logo : ""
  }"   WHERE postId=${id}`;
  const sqlEditComment = `UPDATE tbl_comments SET text = "${text}" WHERE commentId=${id}`;
  const sqlEditReply = `UPDATE tbl_replies SET text = "${text}" WHERE replyId=${id}`;
  const sqlGetEditedPost = `SELECT postId, title, text, date, imgUrl, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo FROM tbl_post WHERE postId=?`;
  const sqlGetEditedComment = `SELECT commentId, text FROM tbl_comments WHERE commentId=?`;
  const sqlGetEditedReply = `SELECT replyId, fk_commentId, text FROM tbl_replies WHERE replyId=?`;

  try {
    switch (origin) {
      case "post": {
        const res0 = await db.execute(sqlEditPost);
        const [edit, _] = await db.execute(sqlGetEditedPost, [id]);
        if (res0 && edit) {
          const edited = {
            ...edit[0],
            id: edit[0].postId,
            isPreview: edit[0].isPreview === 1 ? true : false,
            preview: {
              title: edit[0].previewTitle,
              text: edit[0].previewText,
              image: edit[0].previewImg,
              publisher: edit[0].previewPub,
              logo: edit[0].previewPubLogo,
              url: edit[0].previewUrl,
            },
          };
          delete edited.postId;
          console.log(edited);
          return res.status(200).json({ edit: edited });
        }
      }
      case "comment": {
        const res2 = await db.execute(sqlEditComment);
        const [edit, _] = await db.execute(sqlGetEditedComment, [id]);
        if (res2 && edit) return res.status(200).json({ edit: edit[0] });
      }
      case "reply": {
        const res4 = await db.execute(sqlEditReply);
        const [edit, _] = await db.execute(sqlGetEditedReply, [id]);
        if (res4 && edit) {
          console.log("edited reply", edit[0]);
          return res.status(200).json({ edit: edit[0] });
        }
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
  console.log(postId, origin, postIdComment);
  const sql_deletePost = `DELETE FROM tbl_post WHERE postId=${postId}`;
  const sql_deleteComment = `DELETE FROM tbl_comments WHERE commentId=${postId}`;
  const sql_decreaseCommentCount = `UPDATE tbl_post SET commentCount= commentCount-1 WHERE postId=${postIdComment}`;
  const sql_deleteReply = `DELETE FROM tbl_replies WHERE replyId=${postId}`;
  const sql_decreaseReplyCount = `UPDATE tbl_comments SET replyCount= replyCount-1 WHERE commentId=${postIdComment}`;
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
        const res4 = await db.execute(sql_decreaseReplyCount);
        if (res3 && res4) return res.status(200).json({ msg: "reply deleted" });
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
  const {
    comment: {
      fk_userId_comment: userId,
      fk_postId_comment: postId,
      text,
      date,
    },
  } = req.body;
  const sql_createComment = `INSERT INTO tbl_comments (fk_userId_comment, fk_postId_comment, text, date) VALUES (${userId},${postId},"${text}","${date}")`;
  const sql_increaseCommentCount = `UPDATE tbl_post SET commentCount = commentCount+1 WHERE postId=${postId}`;
  const sql_getCommentCount = `SELECT commentCount FROM tbl_post WHERE postId = ${postId} `;
  const sql_getComment = `SELECT commentId, fk_postId_comment, fk_userId_comment, text, date, likesCount, replyCount, (SELECT username FROM tbl_user WHERE tbl_user.id=${userId}) as username,  (SELECT picUrl FROM tbl_user WHERE tbl_user.id = ${userId}) as picUrl FROM tbl_comments WHERE tbl_comments.commentId=?`;
  try {
    const [comment, __] = await db.execute(sql_createComment);
    const updatedCount = await db.execute(sql_increaseCommentCount);
    if (comment && updatedCount) {
      const [count, _] = await db.execute(sql_getCommentCount);
      const [newComment, __] = await db.execute(sql_getComment, [
        comment.insertId,
      ]);
      if (count && newComment) {
        console.log("COUNT", count[0].commentCount);
        console.log("NEW COMMENT", newComment);
        res.status(201).json({
          count: count[0].commentCount,
          newComment: { ...newComment[0], replies: [] },
        });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: "database" });
  }
};

export const getComments = async (req, res) => {
  const { postId } = req.params;
  const sql_getComments = `SELECT commentId, fk_postId_comment, fk_userId_comment, text, date, likesCount,replyCount, (SELECT username FROM tbl_user WHERE tbl_user.id=tbl_comments.fk_userId_comment) as username,  (SELECT picUrl FROM tbl_user WHERE tbl_user.id = tbl_comments.fk_userId_comment) as picUrl FROM tbl_comments WHERE tbl_comments.fk_postId_comment=?`;
  const sql_getReplies = `SELECT replyId, fk_commentId, fk_userId_reply, text, date, likesCount, (SELECT username FROM tbl_user WHERE tbl_user.id=tbl_replies.fk_userId_reply) as username,  (SELECT picUrl FROM tbl_user WHERE tbl_user.id = tbl_replies.fk_userId_reply) as picUrl FROM tbl_replies WHERE tbl_replies.fk_commentId=?`;
  let replies = [];
  try {
    const [result, _] = await db.execute(sql_getComments, [postId]);
    if (result) {
      let comments = await Promise.all(
        result.map(async (comment) => {
          const [res2, __] = await db.execute(sql_getReplies, [
            comment.commentId,
          ]);
          if (res2) {
            console.log("replies", res2);
            replies = res2;
            return (comment = {
              ...comment,
              replies,
            });
          }
        })
      );
      if (comments) {
        comments = comments.sort((a, b) => {
          if (a.commentId > b.commentId) return -1;
          if (b.commentId < b.commentId) return 1;
          return 0;
        });
        console.log("comments", comments);
        return res.status(200).json({ comments });
      }
    }
  } catch (err) {
    console.log("erreur", err);
    return res.status(500).json({ error: "database" });
  }
};

////////////////////
// REPLY TO COMMENT
////////////////////

export const createReply = async (req, res, next) => {
  const {
    reply: { fk_userId_reply: userId, fk_commentId: commentId, text, date },
  } = req.body;
  console.log("REPLY", userId, commentId, text, date);
  const sql_createReply = `INSERT INTO tbl_replies (fk_commentId, fk_userId_reply, text, date) VALUES (${commentId},${userId},"${text}","${date}")`;
  const sql_increaseReplyCount = `UPDATE tbl_comments SET replyCount = replyCount+1 WHERE commentId=${commentId}`;
  const sql_getReply = `SELECT replyId, fk_commentId, fk_userId_reply, text, date, likesCount, (SELECT username FROM tbl_user WHERE tbl_user.id=${userId}) as username,  (SELECT picUrl FROM tbl_user WHERE tbl_user.id = ${userId}) as picUrl FROM tbl_replies WHERE tbl_replies.replyId=?`;
  try {
    const res0 = await db.execute(sql_createReply);
    const res1 = await db.execute(sql_increaseReplyCount);
    if (res0 && res1) {
      const [newReply, _] = await db.execute(sql_getReply, [res0[0].insertId]);
      // console.log("RES 0", res0[0]);
      console.log("RESULT CREATE/GET REPLY:", newReply[0]);
      res
        .status(201)
        .json({ replyId: res0[0].insertId, newReply: newReply[0] });
    }
  } catch (err) {
    console.log("ERROR", err);
    res.status(500).json({ error: "database" });
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
