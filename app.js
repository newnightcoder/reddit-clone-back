import aws from "aws-sdk";
import cors from "cors";
import express from "express";
import * as path from "path";
import "./middleware/metascraper.js";
import authRoute from "./routes/authRoute.js";
import postRoute from "./routes/postRoute.js";

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.resolve();
console.log("dirname", __dirname);

const s3 = new aws.S3();

// app middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routes middlewares
app.use("/userpics", express.static(path.join(__dirname, "userpics")));
app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
// app.use("/api", (req, res) => {
//   res.send("app working");
// });

app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
  s3.listObjects({ Bucket: "forum-s3-bucket" }, (err, data) => {
    if (err) {
      console.log(err, err.stack);
    } else console.log(data);
  });
});
