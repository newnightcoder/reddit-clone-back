import cors from "cors";
import express from "express";
import * as path from "path";
import authRoute from "./routes/authRoute.js";
import postRoute from "./routes/postRoute.js";

const app = express();
const PORT = 3001;
const __dirname = path.resolve();

// app middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// routes middlewares
app.use("/userpics", express.static(path.join(__dirname, "userpics")));
app.use("/auth", authRoute);
app.use("/", postRoute);

app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
});
