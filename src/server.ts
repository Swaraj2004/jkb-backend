import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// const prisma = new PrismaClient();

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));