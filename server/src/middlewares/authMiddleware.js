import JWT from "jsonwebtoken";
import userModel from "../models/Users.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).send({
      success: false,
      message: "No token provided or invalid token format",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).send({
      success: false,
      message: "No token provided",
    });
  }

  try {
    const SECRET_KEY = process.env.JWT_SECRET_KEY;

    const decode = JWT.verify(token, SECRET_KEY);
    req.user = decode;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).send({
      success: false,
      message: "Error in authentication middleware",
      error: error.message,
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      message: "Error in admin middleware",
      error,
    });
  }
};
