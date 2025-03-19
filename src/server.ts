import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swaggerConfig";
import userRoutes from "./routes/userRoutes";
import loginRoutes from "./routes/loginRoutes";
import productRoutes from "./routes/productRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs available at http://localhost:${PORT}/docs`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// API Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});
app.use("/api/users", userRoutes);
app.use("/", loginRoutes);
app.use("/api/products", productRoutes);

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;