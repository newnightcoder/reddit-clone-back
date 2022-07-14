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
userRoute.get("/:id", authorizeToken, userController.getUserProfile);
userRoute.post("/pic", upload, userController.addUserPic);
userRoute.post("/pic/delete", authorizeToken, userController.deleteUserpic);
userRoute.post("/delete", authorizeToken, userController.deleteUser);

// RECENT USERS & MODS
userRoute.get("/recent", userController.getRecentUsers);
userRoute.get("/mods", userController.getMods);

// LIKE
userRoute.post("/like", authorizeToken, userController.likePost);

// FOLLOWERS
userRoute.get("/follow/:id", authorizeToken, userController.getFollowers);
userRoute.post("/follow", authorizeToken, userController.follow);

// SEARCH
userRoute.get("/search/:query/:filter", userController.getSearchResults);

export default userRoute;
