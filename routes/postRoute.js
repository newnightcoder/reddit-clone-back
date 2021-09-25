import express from "express";
import * as postController from "../controllers/postController.js";

const postRouter = express.Router();

postRouter.post("/", postController.createPost);

export default postRouter;
