import express from "express";
import * as postController from "../controllers/postController.js";

const postRouter = express.Router();

postRouter.post("/", postController.createPost);
postRouter.get("/", postController.getPosts);
postRouter.post("/like", postController.likePost);
postRouter.post("/comment", postController.createComment);
postRouter.get("/comment", postController.getComments);
postRouter.post("/reply", postController.createReply);
postRouter.get("/reply", postController.getReplies);

export default postRouter;
