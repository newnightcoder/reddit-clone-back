import "dotenv/config";
import jwt from "jsonwebtoken";

// JWT creation
export const createToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "24h",
  });
};

// auth middleware
export const authorizeToken = (req, res, next) => {
  try {
    const authHeaders = req.headers.authorization;
    const token = authHeaders?.split(" ")[1];
    if (!token) {
      console.log("NO AUTH TOKEN");
      console.log(req.originalUrl);
      console.log("ça vient de:", req.path);
      return res.status(401).json({ error: "noAuthToken" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.log("EXPIRED");
          return res.status(403).json({ sessionExpired: true });
        } else {
          console.log("tokenVerifyError");
          return res.status(403).json({ error: "tokenVerifyError" });
        }
      }
      req.user = user;
      next();
    });
  } catch (err) {
    console.log("authTokenError");
    res.status(500).json({ error: "authTokenError" });
  }
};
