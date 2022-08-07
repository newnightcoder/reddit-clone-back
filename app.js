import cors from "cors";
import express from "express";
import "./middleware/metascraper.js";
import postRoute from "./routes/postRoute.js";
import userRoute from "./routes/userRoute.js";

const app = express();
const PORT = process.env.PORT || 3001;

// app middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// routes middlewares
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);

app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
});
