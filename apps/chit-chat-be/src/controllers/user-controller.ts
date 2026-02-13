import { Request, Response } from "express";

export const authMe = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    return res.status(200).json({ user });
  } catch (error) {
    console.log("Error in authMe controller:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
