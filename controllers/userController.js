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
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({ error: timeout ? "timeout" : "database" });
  }
};

////////////////////////////
// CREATE NEW USER STEP 1
/////////////////////////////

export const createUser = async (req, res, next) => {
  const { email, password, date } = req.body;
  console.log("SIGNUP INFO", email, password, date);
  const salt = 10;
  const hash = bcrypt.hashSync(password, salt);
  const user = new User(null, email, hash, null, date);
  console.log("DATE", date);
  try {
    const userId = await user.create();
    if (userId) return res.status(201).json({ userId });
  } catch (err) {
    console.log(err);
    const { errno, code } = err;
    const timeout = code === "ETIMEDOUT" || code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({
      error:
        errno === 1062 ? "duplicateEmail" : timeout ? "timeout" : "database",
    });
  }
};

//////////////////////////////////////
// ADD USERNAME (CREATE USER STEP 2)
//////////////////////////////////////

export const addUserName = async (req, res, next) => {
  const { id, name } = req.body;
  console.log(id, name);
  const user = new User(id, null, null, name, null);
  try {
    const result = await user.addUsername();
    const accessToken = createToken(id);
    res.status(200).json({ result, accessToken, isNewUser: true });
  } catch (err) {
    const { errno, code } = err;
    const timeout = code === "ETIMEDOUT" || code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({
      error:
        errno === 1062
          ? "duplicateUsername"
          : errno === 1406
          ? "nameTooLong"
          : timeout
          ? "timeout"
          : "database",
    });
  }
};

////////////////////////////////////////////////////
// ADD USER PIC (CREATE USER STEP 3 / EDIT PROFILE)
////////////////////////////////////////////////////

export const addUserPic = async (req, res, next) => {
  const fileLocation = req.file?.location;
  const { id, imgType } = req.body;
  const user = new User(id);
  console.log(fileLocation, id, imgType);
  try {
    const picUrl = await user.addAvatarImg(fileLocation, imgType);
    if (picUrl) res.status(200).json({ picUrl });
  } catch (err) {
    console.log("ERROR", err);
    res.status(500).json({ error: "database" });
  }
};

export const deleteUserpic = async (req, res) => {
  const { id, imgType } = req.body;
  const sql_deletePicUrl = `UPDATE tbl_user SET picUrl = ${null} WHERE id = ?`;
  const sql_deleteBannerUrl = `UPDATE tbl_user SET bannerUrl = ${null} WHERE id = ?`;
  try {
    switch (imgType) {
      case "pic": {
        const result = await db.execute(sql_deletePicUrl, [id]);
        if (result) return res.status(200).json({ result: "pic deleted" });
      }
      case "banner": {
        const result = await db.execute(sql_deleteBannerUrl, [id]);
        if (result) return res.status(200).json({ result: "banner deleted" });
      }
      default:
        return;
    }
  } catch (err) {
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({ error: timeout ? "timeout" : "database" });
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
    console.log("ERROR", err, "ERROR MSG", err.message);
    const { errno } = err;
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({
      error:
        errno === 1062
          ? "duplicateUsername"
          : errno === 1406
          ? "nameTooLong"
          : timeout
          ? "timeout"
          : "database",
    });
  }
};

///////////////////
// GET RECENT USERS
///////////////////

export const getRecentUsers = async (req, res, next) => {
  const sql_getAllUsers = `SELECT id, username, picUrl, bannerUrl, creationDate, role FROM tbl_user`;
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
      res.status(200).json({ recentUsers });
    }
  } catch (err) {
    console.log(err);
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    return res.status(500).json({ error: timeout ? "timeout" : "database" });
  }
};

///////////////////
// GET MODS
///////////////////

export const getMods = async (req, res, next) => {
  const sql_getMods = `SELECT id, username, picUrl, creationDate, role FROM tbl_user WHERE role="admin";`;
  try {
    const [mods, _] = await db.execute(sql_getMods);
    if (mods) return res.status(200).json({ mods });
  } catch (err) {
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    return res.status(500).json({ error: timeout ? "timeout" : "database" });
  }
};

/////////////////////////////////////
// GET SOME USER PROFILE
/////////////////////////////////////

export const getUserProfile = async (req, res) => {
  const { id } = req.params;
  const sql_getUserProfile = `SELECT id, username, picUrl, bannerUrl, creationDate, followingCount, followersCount FROM tbl_user WHERE id=?`;
  try {
    const [user, _] = await db.execute(sql_getUserProfile, [id || null]);
    if (user.length > 0) {
      console.log(user);
      res.status(200).json({ user: user[0] });
    } else res.status(500).json({ error: "database" });
  } catch (err) {
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({ error: timeout ? "timeout" : "database" });
  }
};

/////////////////////////////////////
// DELETE USER
/////////////////////////////////////

export const deleteUser = async (req, res, next) => {
  const { id } = req.body;
  const user = new User(id);
  try {
    const deleted = await user.delete();
    if (deleted) return res.status(200).json({ status: 200 });
  } catch (err) {
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({ error: timeout ? "timeout" : "database" });
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
        const timeout =
          err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
        res.status(500).json({ error: timeout ? "timeout" : "database" });
      }
      break;
    default:
      return;
  }
};

////////////////////
//  FOLLOW / UNFOLLOW
////////////////////

export const follow = async (req, res) => {
  const { myId, userId, bool } = req.body;
  const sql_follow = `INSERT INTO tbl_follow (fk_userId_followed, fk_userId_following) VALUES ((SELECT id FROM tbl_user WHERE id=?),(SELECT id FROM tbl_user WHERE id=?))`;
  const sql_unfollow = `DELETE FROM tbl_follow WHERE fk_userId_followed = ? AND fk_userId_following = ?`;
  const sql_increaseFollowingCount = `UPDATE tbl_user SET followingCount=followingCount+1 WHERE id=?`;
  const sql_decreaseFollowingCount = `UPDATE tbl_user SET followingCount=followingCount-1 WHERE id=?`;
  const sql_increaseFollowersCount = `UPDATE tbl_user SET followersCount=followersCount+1 WHERE id=?`;
  const sql_decreaseFollowersCount = `UPDATE tbl_user SET followersCount=followersCount-1 WHERE id=?`;

  try {
    switch (bool) {
      case true:
        const res1 = await db.execute(sql_follow, [userId, myId]);
        const res2 = await db.execute(sql_increaseFollowingCount, [myId]);
        const res3 = await db.execute(sql_increaseFollowersCount, [userId]);
        if (res1 && res2 && res3) {
          console.log(
            "YAY",
            "RES FOLLOW",
            res1,
            "RES INCREASE FOLLOWING COUNT",
            res2,
            "RES INCREASE FOLLOWERS COUNT",
            res3
          );
          return res.status(200).json({ msg: "db updated follow" });
        }
      case false:
        const res4 = await db.execute(sql_unfollow, [userId, myId]);
        const res5 = await db.execute(sql_decreaseFollowingCount, [myId]);
        const res6 = await db.execute(sql_decreaseFollowersCount, [userId]);
        if (res4 && res5 && res6) {
          console.log(
            "YAY",
            "RES UNFOLLOW",
            res4,
            "RES DECREASE FOLLOWING COUNT",
            res5,
            "RES DECREASE FOLLOWERS COUNT",
            res6
          );
          res.status(200).json({ msg: "db updated unfollow" });
        }
      default:
    }
  } catch (err) {
    console.log(err);
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({ error: timeout ? "timeout" : "database" });
  }
};

//////////////////////////////
//  GET FOLLOWING / FOLLOWERS
//////////////////////////////

export const getFollowers = async (req, res) => {
  const { id } = req.params;
  const sql_getFollowers = `SELECT id, (SELECT username FROM tbl_user WHERE id=fk_userId_following) as username, (SELECT picUrl FROM tbl_user WHERE id=fk_userId_following) as picUrl, (SELECT id FROM tbl_user WHERE id=fk_userId_following) as userId  FROM tbl_follow WHERE tbl_follow.fk_userId_followed=? `;
  const sql_getFollowing = `SELECT id, (SELECT username FROM tbl_user WHERE id=fk_userId_followed) as username, (SELECT picUrl FROM tbl_user WHERE id=fk_userId_followed) as picUrl, (SELECT id FROM tbl_user WHERE id=fk_userId_followed) as userId  FROM tbl_follow WHERE tbl_follow.fk_userId_following=? `;
  try {
    const [followers, _] = await db.execute(sql_getFollowers, [id]);
    const [following, __] = await db.execute(sql_getFollowing, [id]);

    if (followers && following) {
      console.log("FOLLOWERS LIST", followers);
      console.log("FOLLOWING LIST", following);
      return res.status(200).json({ followers, following });
    }
  } catch (err) {
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    return res.status(500).json({ error: timeout ? "timeout" : "database" });
  }
};

export const getSearchResults = async (req, res) => {
  const { query, filter } = req.params;
  console.log("QUERY", query, "FILTER", filter);
  console.log("params", req.params);
  const getResultsUser = `SELECT * FROM tbl_user WHERE username LIKE "%${query}%"`;
  const getResultsPost = `SELECT title, postId, text, date, imgUrl, fk_userId_post, username, picUrl, likesCount, commentCount, isPreview, previewTitle, previewText, previewImg, previewPub, previewUrl, previewPubLogo
  FROM tbl_post JOIN tbl_user ON tbl_post.fk_userId_post=tbl_user.id WHERE username LIKE "%${query}%" OR text LIKE "%${query}%" OR title LIKE "%${query}%" OR previewUrl LIKE "%${query}%" OR previewImg LIKE "%${query}%" OR previewPub LIKE "%${query}%" OR previewTitle LIKE "%${query}%" OR previewText LIKE "%${query}%"`;
  const transformPosts = (array) => {
    const posts = array.map((post, i) => {
      return {
        id: post.postId,
        author: {
          id: post.fk_userId_post,
          username: post.username,
          picUrl: post.picUrl,
        },
        title: post.title,
        text: post.text,
        date: post.date,
        imgUrl: post.imgUrl,
        isPreview: post.isPreview === 1 ? true : false,
        preview: {
          title: post.previewTitle,
          text: post.previewText,
          image: post.previewImg,
          publisher: post.previewPub,
          logo: post.previewPubLogo,
          url: post.previewUrl,
        },
        engagement: {
          likesCount: post.likesCount,
          commentCount: post.commentCount,
        },
      };
    });
    return posts;
  };
  try {
    switch (filter) {
      case "user": {
        const [users, _] = await db.execute(getResultsUser, [query]);
        if (users) {
          console.log(users);
          return res.status(200).json({
            results: {
              users,
              posts: [],
            },
          });
        }
      }

      case "post": {
        let [posts, _] = await db.execute(getResultsPost, [query]);
        if (posts) {
          console.log(posts);
          posts = transformPosts(posts);
          return res.status(200).json({
            results: {
              users: [],
              posts,
            },
          });
        }
      }
      default: {
        const [users, __] = await db.execute(getResultsUser, [query]);
        let [posts, _] = await db.execute(getResultsPost, [query]);
        if (users && posts) {
          posts = transformPosts(posts);
          return res.status(200).json({
            results: {
              users,
              posts,
            },
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    const timeout =
      err.code === "ETIMEDOUT" || err.code === "PROTOCOL_CONNECTION_LOST";
    res.status(500).json({ error: timeout ? "timeout" : "database" });
  }
};
