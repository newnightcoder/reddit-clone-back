import express from "express";
import * as user from "../controllers/authController.js";
import { authorizeToken } from "../middleware/jwt.js";
import { upload } from "../middleware/multer.js";

const authRoute = express.Router();

// SIGNUP
authRoute.post("/signup", user.createUser);

// LOGIN
authRoute.post("/login", user.logUser);

// USERNAME
authRoute.post("/username", user.addUserName);
authRoute.post("/edit", authorizeToken, user.editUsername);

// PIC / PROFILE
authRoute.post("/userpic", upload, user.addUserPic);
authRoute.post("/", user.getUserProfile);
authRoute.post("/delete", user.deleteUser);

// LIKE POST
authRoute.post("/like", authorizeToken, user.likePost);

export default authRoute;
