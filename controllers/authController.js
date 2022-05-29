import bcrypt from "bcrypt";
import { db } from "../DB/db.config.js";
import { createToken } from "../middleware/jwt.js";
import { User } from "../models/userModel.js";

//////////////////////
// LOG EXISTING USER
//////////////////////

export const logUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { user, accessToken, error } = await new User(
      null,
      email,
      password
    ).login();

    switch (error) {
      case "404":
        return res.status(404).json({ error });
      case "password":
        return res.status(500).json({ error });
      case "database":
        return res.status(500).json({ error });
      default:
        return res.status(200).json({ user, isNewUser: false, accessToken });
    }
  } catch (err) {
    res.status(500).json({ error: "database" });
  }
};

////////////////////////////
// CREATE NEW USER STEP 1
/////////////////////////////

export const createUser = async (req, res, next) => {
  const { email, password } = req.body;
  const salt = 10;
  const hash = bcrypt.hashSync(password, salt);
  const user = new User(null, email, hash);
  try {
    const userId = await user.create();
    res.status(201).json({ userId });
  } catch (err) {
    const { errno } = err;
    res
      .status(500)
      .json({ error: errno === 1062 ? "duplicateEmail" : "database" });
  }
};

//////////////////////////////////////
// ADD USERNAME (CREATE USER STEP 2)
//////////////////////////////////////

export const addUserName = async (req, res, next) => {
  const { id, username, creationDate } = req.body;
  const user = new User(id, null, null, username, null, null, creationDate);
  try {
    const result = await user.addUsername();
    const accessToken = createToken(id);
    res.status(200).json({ result, accessToken, isNewUser: true });
  } catch (err) {
    const { errno } = err;
    res.status(500).json({
      error: errno === 1062 ? "duplicateUsername" : "database",
    });
  }
};

/////////////////////////////////////
// ADD USER PIC (CREATE USER STEP 3)
/////////////////////////////////////

export const addUserPic = async (req, res, next) => {
  const fileLocation = req.file?.location;
  const { id, imgType } = req.body;
  // console.log("image fileLocation", fileLocation);
  const user = new User(id);

  try {
    const picUrl = await user.addAvatarImg(fileLocation, imgType);
    res.status(200).json({ picUrl });
  } catch (err) {
    res.status(500).json({ error: "database" });
  }
};

/////////////////
// EDIT USERNAME
//////////////////

export const editUsername = async (req, res, next) => {
  const { userId, username } = req.body;
  console.log(userId, username);
  const sql_EditUsername = `UPDATE tbl_user SET username="${username}" WHERE id=${userId}`;
  try {
    const result = await db.execute(sql_EditUsername);
    if (result) {
      console.log(result);
      res.status(200).json({ newName: username });
    }
  } catch (err) {
    const { errno } = err;
    res.status(500).json({
      error: errno === 1062 ? "duplicateUsername" : "database",
    });
  }
};

/////////////////////////////////////
// GET SOME USER PROFILE
/////////////////////////////////////

export const getUserProfile = async (req, res, next) => {
  const id = req.body.id;
  const sql_getUserProfile = `SELECT id, username, picUrl, bannerUrl, creationDate FROM tbl_user WHERE id=?`;
  try {
    const [user, _] = await db.execute(sql_getUserProfile, [id]);
    if (user) {
      console.log("user profile", user[0]);
      res.status(200).json({ user: user[0] });
      next();
    }
  } catch (err) {
    res.status(500).json({ error: "database" });
  }
};

/////////////////////////////////////
// DELETE USER
/////////////////////////////////////

export const deleteUser = async (req, res, next) => {
  const { id } = req.body;
  const user = new User(id, null, null, null, null, null);
  try {
    const deleted = await user.delete();
    if (deleted) return res.status(200);
  } catch (err) {
    res.status(500).json({ error: "database" });
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
          res.status(200).json({ liked: true });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "database" });
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
          res.status(200).json({ liked: false });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ error: "database" });
      }
      break;
    default:
      return;
  }
};
