import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger/swaggerConfig";
import userRoutes from "./routes/userRoutes";
import loginRoutes from "./routes/loginRoutes";
import productRoutes from "./routes/productRoutes";
import studentDetailsRoutes from "./routes/studentDetailsRoutes";
import branchRoutes from "./routes/branchRoutes";
import coursePackageRoutes from "./routes/coursePackageRoutes";
import roleRoutes from "./routes/roleRoutes";
import professorRoutes from "./routes/professorRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import testRoutes from "./routes/testRoutes";
import mhaiRoutes from "./routes/mhai_routes";
import miscellaneousRoutesRoutes from "./routes/miscellaneousRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📄 Swagger docs available at http://localhost:${PORT}/docs`);
});

// Middleware

const allowedOrigins = process.env.HOST_URLS?.split(",") || [];
app.use(cors({
  origin: function (origin, callback) {
    const cleanedOrigin = origin?.replace(/\/$/, "");
    if (!cleanedOrigin || allowedOrigins.includes(cleanedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,       // to allow cookies
  // methods: 'GET,PUT,POST,DELETE'   // if we uncoment this then only the given methods will be allowed
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.get("/", (req: Request, res: Response): void => {
  res.send("Server is running");
});
app.use(`/api/v3`, attendanceRoutes);
app.use(`/api/v3/admin/branches`, branchRoutes);
app.use(`/api/v3/admin`, coursePackageRoutes);
app.use(`/api/v3/auth`, loginRoutes);
app.use(`/api/v3`, paymentRoutes);
app.use(`/api/v3/api/products`, productRoutes);
app.use(`/api/v3/professor`, professorRoutes);
app.use(`/api/v3/auth`, roleRoutes);
app.use(`/api/v3/student-details`, studentDetailsRoutes);
app.use(`/api/v3/admin`, subjectRoutes);
app.use('/api/v3/', testRoutes);
app.use(`/api/v3/auth/users`, userRoutes);
app.use(`/api/v3`, mhaiRoutes);
app.use('/api/v3', miscellaneousRoutesRoutes);

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
