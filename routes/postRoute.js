import express from "express";
import * as postController from "../controllers/postController.js";

const postRouter = express.Router();

postRouter.post("/", postController.createPost);
postRouter.get("/", postController.getPosts);
postRouter.post("/like", postController.likePost);
postRouter.post("/dislike", postController.dislikePost);

export default postRouter;
