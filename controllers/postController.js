export const createPost = (req, res, next) => {
  console.log("titre reçu du front:", req.body.title);
  console.log("text reçu du front:", req.body.text);
  console.log("id user reçu du front:", req.body.userId);
  res.status(201).json({
    message: "post bien reçu en back 👍🏾",
  });

  // const post = {
  //   title: JSON.stringify(req?.body.title),
  //   text: JSON.stringify(req?.body.title),
  //   userId: req?.body.userId,
  // };

  // db.getConnection((err, connection) => {
  //   connection.release();

  //   if (err) {
  //     console.log(err.message);
  //     return;
  //   }

  //   const CREATE_POST = "";

  //   // SAVE POST IN DB
  //   connection.query(CREATE_POST, (err, result, fields) => {
  //     if (err) {
  //       console.log(err.message);
  //       res.status(500).json({
  //         errorMsg: "oops petit problème DB!",
  //       });
  //       return;
  //     }
  //     console.log("result:", result);
  //     console.log("fields:", fields);
  //     res.status(201).json({
  //       message: "post créé et sauvé dans la DB!👍🏾",
  //     });
  //   });

  //   const GET_POST = "";
  //   // RETRIEVE POST FROM DB (TO DISPLAY IN FEED)
  //   connection.query(GET_POST, (err, result, fields) => {
  //     if (err) {
  //       console.log(err.message);
  //       res.status(500).json({
  //         errorMsg: "oops petit problème DB!",
  //       });
  //       return;
  //     }
  //     console.log("result:", result);
  //     console.log("fields:", fields);
  //     res.status(200).json({
  //       message: "post renvoyé de la DB!👌🏾",
  //     });
  //   });
  // });
};
