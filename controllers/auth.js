export const createUser = (req, res, next) => {
  console.log(req.body);
  res.status(201).json({ message: "backend says hi" });
  next();
};
