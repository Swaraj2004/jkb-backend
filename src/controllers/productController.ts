import { Request, Response } from 'express';

export const getProducts = (req: Request, res: Response) => {
  res.json([
    { id: 101, name: 'Laptop' },
    { id: 102, name: 'Phone' },
  ]);
};
