import cors from "cors";
import express from "express";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  console.log(req.body.userInput);
  res.status(200).json({
    message: "backend says hi!",
  });
});

// app.get("/", (req, res) => {
//   const testQuery = "USE redditDB";
//   db.getConnection((err, connexion) => {
//     if (err) {
//       console.log(err.message);
//       return;
//     }
//     console.log("connexion launched!");
//     connexion.query(testQuery, (err, result, fields) => {
//       connexion.release();
//       if (err) {
//         console.log("erreur test:", err);
//         return;
//       }
//       console.log("result!:", result);
//       console.log("fields!:", fields);
//       res.send("working like a charm!");
//     });
//   });
// });

app.listen(PORT, () => {
  console.log(`server's running on port ${PORT}`);
});
