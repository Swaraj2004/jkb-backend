import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger/swaggerConfig";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
// const prisma = new PrismaClient();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// const prisma = new PrismaClient();

// API Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;