import express from "express";
import * as auth from "../controllers/auth.js";
const authRoute = express.Router();

authRoute.post("/signup", auth.createUser);
authRoute.post("/signup/username", auth.addUserName);
authRoute.post("/login", auth.logUser);

export default authRoute;
