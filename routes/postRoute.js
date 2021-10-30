import express from "express";
import * as postController from "../controllers/postController.js";
import { authorizeToken } from "../middleware/jwt.js";

const postRouter = express.Router();

postRouter.post("/", authorizeToken, postController.createPost);
postRouter.get("/", postController.getPosts);
postRouter.post("/like", postController.likePost);
postRouter.post("/comment", postController.createComment);
postRouter.get("/comment", postController.getComments);
postRouter.post("/reply", postController.createReply);
postRouter.get("/reply", postController.getReplies);
postRouter.post("/delete", postController.deletePost);

export default postRouter;
