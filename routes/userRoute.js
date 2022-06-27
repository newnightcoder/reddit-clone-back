import express from "express";
import * as userController from "../controllers/userController.js";
import { authorizeToken } from "../middleware/jwt.js";
import { upload } from "../middleware/multer.js";

const userRoute = express.Router();

// SIGNUP
userRoute.post("/signup", userController.createUser);

// LOGIN
userRoute.post("/login", userController.logUser);

// USERNAME
userRoute.post("/username", userController.addUserName);
userRoute.post("/edit", authorizeToken, userController.editUsername);

// PIC / PROFILE
userRoute.post("/userpic", upload, userController.addUserPic);
userRoute.post("/", authorizeToken, userController.getUserProfile);
userRoute.post("/delete", authorizeToken, userController.deleteUser);

// RECENT USERS & MODS
userRoute.get("/user", userController.getRecentUsers);
userRoute.get("/mods", userController.getMods);

// LIKE
userRoute.post("/like", authorizeToken, userController.likePost);

// FOLLOWERS
userRoute.get("/follow/:id", authorizeToken, userController.getFollowers);
userRoute.post("/follow", authorizeToken, userController.follow);

// SEARCH
userRoute.get("/search/:query/:filter", userController.getSearchResults);

export default userRoute;
