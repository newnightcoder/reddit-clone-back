import express from "express";
import * as auth from "../controllers/authController.js";
import { upload } from "../middleware/multer.js";

const authRoute = express.Router();

authRoute.post("/", auth.createUser);
authRoute.post("/username", auth.addUserName);
authRoute.post("/userpic", upload.single("userpic"), auth.addUserPic);
authRoute.post("/", auth.logUser);

export default authRoute;
