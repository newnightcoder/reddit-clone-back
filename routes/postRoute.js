import express from "express";
import * as postController from "../controllers/postController.js";
import { authorizeToken } from "../middleware/jwt.js";
import { upload } from "../middleware/multer.js";

const postRouter = express.Router();

postRouter.post("/", authorizeToken, postController.createPost);
postRouter.post("/post-image", upload, postController.savePostImg);
// postRouter.post("/delete-image", upload, postController.deletePostImage);
postRouter.post("/edit", authorizeToken, postController.editPost);
postRouter.get("/", authorizeToken, postController.getPosts);
postRouter.post("/user", authorizeToken, postController.getUserPosts);
postRouter.get("/user", authorizeToken, postController.getUsers);
postRouter.post("/like", authorizeToken, postController.likePost);
postRouter.get("/like", authorizeToken, postController.getLikes);
postRouter.post("/comment", authorizeToken, postController.createComment);
postRouter.get("/comment", authorizeToken, postController.getComments);
postRouter.post("/reply", authorizeToken, postController.createReply);
postRouter.get("/reply", authorizeToken, postController.getReplies);
postRouter.post("/delete", authorizeToken, postController.deletePost);

export default postRouter;
