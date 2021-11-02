import express from "express";
import * as auth from "../controllers/authController.js";
import { upload } from "../middleware/multer.js";

const authRoute = express.Router();

authRoute.post("/signup", auth.createUser);
authRoute.post("/username", auth.addUserName);
authRoute.post("/userpic", upload, auth.addUserPic);
authRoute.post("/login", auth.logUser);
authRoute.post("/delete", auth.deleteUser);
authRoute.post("/", auth.getUserProfile);

export default authRoute;
