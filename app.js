import cors from "cors";
import express from "express";
import authRoute from "./routes/authRoute.js";

const app = express();
const PORT = 3001;

// app middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// routes middlewares
app.use("/signup", authRoute);
app.use("/login", authRoute);

app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
});
