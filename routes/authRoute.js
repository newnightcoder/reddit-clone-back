import express from "express";
import * as auth from "../controllers/auth.js";
const authRoute = express.Router();

authRoute.post("/signup", auth.createUser);

export default authRoute;
