import User from "../models/User";
import { compare, hash } from "bcrypt-ts";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session";

const ACCESS_TOKEN_TTL = "15m"; // under 15 minutes
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "Username, password and email are required." });
    }

    // Check user existence
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already in use." });
    }

    // Encrypt password
    const hashedPassword = await hash(password, 10);

    // Create user
    const newUser = new User({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });

    await newUser.save();

    return res.status(204).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error during sign up:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    // Compare hased password in DB and password
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate accessToken by JWT
    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // Generate refreshToken
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // Create new session to save refreshToken
    await Session.create({
      userId: user._id,
      refreshToken,
      expiredAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // Send refreshToken in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    // Send accessToken in response
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error during sign in:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    // get refreshToken from cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    // Delete session associated with the refresh token
    await Session.findOneAndDelete({ refreshToken });

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Error during sign out:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Create new access token when access token expired and refresh token is valid
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token not found." });
    }

    // Compare refresh token in db
    const session = await Session.findOne({ refreshToken: token });

    if (!session) {
      return res
        .status(403)
        .json({ message: "Token is invalid or has expired." });
    }

    // Check if expired
    if (session.expiredAt < new Date()) {
      return res.status(403).json({ message: "Token has expired." });
    }

    // Create new access token
    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error during refresh token:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
