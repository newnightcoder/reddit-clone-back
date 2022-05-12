import express from "express";
import * as postController from "../controllers/postController.js";
import { authorizeToken } from "../middleware/jwt.js";
import { upload } from "../middleware/multer.js";

const postRouter = express.Router();

// USER
postRouter.get("/user", postController.getRecentUsers);
postRouter.get("/mods", postController.getMods);
postRouter.post("/user", authorizeToken, postController.getUserPosts);

// POSTS
postRouter.get("/", postController.getPosts);
postRouter.post("/post-image", upload, postController.savePostImg);
postRouter.post("/post-link", postController.sendLinkData);
postRouter.post("/", authorizeToken, postController.createPost);
postRouter.post("/edit", authorizeToken, postController.editPost);
postRouter.post("/delete", authorizeToken, postController.deletePost);

// COMMENT
postRouter.get("/comment", authorizeToken, postController.getComments);
postRouter.post("/comment", authorizeToken, postController.createComment);

// LIKE
postRouter.get("/like", postController.getLikes);

// REPLY
postRouter.get("/reply", authorizeToken, postController.getReplies);
postRouter.post("/reply", authorizeToken, postController.createReply);

export default postRouter;
