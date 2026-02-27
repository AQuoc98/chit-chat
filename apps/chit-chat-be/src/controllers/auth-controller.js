import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "All of username, password, email, firstName, and lastName are required",
      });
    }

    // check username exists or not
    const duplicate = await User.findOne({ username });

    if (duplicate) {
      return res.status(409).json({ message: "username already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    // create user
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${lastName} ${firstName}`,
    });

    // return
    return res.sendStatus(204);
  } catch (error) {
    console.error("Error in signUp", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password." });
    }

    // get hashedPassword from db to compare with input password
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "username or password is incorrect" });
    }

    // check password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "username or password is incorrect" });
    }

    // if match, create accessToken with JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // create refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // create a new session to store the refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // return refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });

    // return access token in response
    return res
      .status(200)
      .json({ message: `User ${user.displayName} logged in!`, accessToken });
  } catch (error) {
    console.error("Error in signIn", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signOut = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      // delete refresh token from Session
      await Session.deleteOne({ refreshToken: token });

      // clear cookie
      res.clearCookie("refreshToken");
    }

    return res.sendStatus(204);
  } catch (error) {
    console.error("Error in signOut", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// create a new access token from refresh token
export const refreshToken = async (req, res) => {
  try {
    // get refresh token from cookie
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Token does not exist." });
    }

    // compare with refresh token in db
    const session = await Session.findOne({ refreshToken: token });

    if (!session) {
      return res
        .status(403)
        .json({ message: "Token is invalid or has expired" });
    }

    // check if expired
    if (session.expiresAt < new Date()) {
      return res.status(403).json({ message: "Token has expired." });
    }

    // create a new access token
    const accessToken = jwt.sign(
      {
        userId: session.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // return
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error in refreshToken", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
