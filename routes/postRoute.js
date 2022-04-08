import express from "express";
import * as postController from "../controllers/postController.js";
import { authorizeToken } from "../middleware/jwt.js";
import { upload } from "../middleware/multer.js";

const postRouter = express.Router();

postRouter.get("/", postController.getPosts);
postRouter.get("/user", postController.getUsers);
postRouter.get("/like", postController.getLikes);
postRouter.post("/", authorizeToken, postController.createPost);
postRouter.post("/post-image", upload, postController.savePostImg);
postRouter.post("/post-link", postController.sendLinkData);
// postRouter.post("/delete-image", upload, postController.deletePostImage);
postRouter.post("/edit", authorizeToken, postController.editPost);
postRouter.post("/user", authorizeToken, postController.getUserPosts);
postRouter.post("/like", authorizeToken, postController.likePost);
postRouter.post("/comment", authorizeToken, postController.createComment);
postRouter.get("/comment", authorizeToken, postController.getComments);
postRouter.post("/reply", authorizeToken, postController.createReply);
postRouter.get("/reply", authorizeToken, postController.getReplies);
postRouter.post("/delete", authorizeToken, postController.deletePost);

export default postRouter;
