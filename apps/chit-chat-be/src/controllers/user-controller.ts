import { Request, Response } from "express";

export const authMe = async (req: Request, res: Response) => {
  return res.status(200).json({ message: "Authenticated user info." });
};
