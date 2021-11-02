import express from "express";
import * as postController from "../controllers/postController.js";
import { authorizeToken } from "../middleware/jwt.js";

const postRouter = express.Router();

postRouter.post("/", authorizeToken, postController.createPost);
postRouter.get("/", authorizeToken, postController.getPosts);
postRouter.post("/like", authorizeToken, postController.likePost);
postRouter.post("/comment", authorizeToken, postController.createComment);
postRouter.get("/comment", authorizeToken, postController.getComments);
postRouter.post("/reply", authorizeToken, postController.createReply);
postRouter.get("/reply", authorizeToken, postController.getReplies);
postRouter.post("/delete", authorizeToken, postController.deletePost);

export default postRouter;
