import { Request, Response } from "express";

export const getUsers = (req: Request, res: Response) => {
  res.json([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]);
};

export const createUser = (req: Request, res: Response) => {
  const { name } = req.body;
  res.status(201).json({ id: Math.random(), name });
};
