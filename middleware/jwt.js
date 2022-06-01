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
      return res.status(401).json({ error: "noAuthToken" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(403).json({ sessionExpired: true });
        } else return res.status(403).json({ error: "tokenVerifyError" });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ error: "authTokenError" });
  }
};
