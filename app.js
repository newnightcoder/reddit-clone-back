import cors from "cors";
import express from "express";
import "./middleware/metascraper.js";
import authRoute from "./routes/authRoute.js";
import postRoute from "./routes/postRoute.js";

const app = express();
const PORT = process.env.PORT || 3001;

// app middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes middlewares
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);

app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
});
