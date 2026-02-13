import jwt from "jsonwebtoken";
import User from "../models/User";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

// Extend Express Request type to include user property
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: mongoose.Document;
    }
  }
}

// Define JWT payload type
interface JwtPayload {
  userId: string;
}

export const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // get token from headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token is missing." });
    }

    // verify token (promisified version)
    const decodedUser = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as JwtPayload;

    // find user
    const user = await User.findById(decodedUser.userId).select(
      "-hashedPassword",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protected middleware:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: "Invalid access token." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};
