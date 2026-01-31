import User from "../models/User";
import { hash } from "bcrypt-ts";
import { Request, Response } from "express";

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
