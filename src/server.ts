import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec, { BASE_URLS } from "./swagger/swaggerConfig";
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
    if (!origin || allowedOrigins.includes(origin)) {
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
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});
app.use(BASE_URLS.ATTENDANCE, attendanceRoutes);
app.use(BASE_URLS.BRANCHES, branchRoutes);
app.use(BASE_URLS.ADMIN, coursePackageRoutes);
app.use(BASE_URLS.AUTH, loginRoutes);
app.use(BASE_URLS.PAYMENT, paymentRoutes);
app.use(BASE_URLS.PRODUCTS, productRoutes);
app.use(BASE_URLS.PROFESSOR, professorRoutes);
app.use(BASE_URLS.AUTH, roleRoutes);
app.use(BASE_URLS.STUDENT_DETAILS, studentDetailsRoutes);
app.use(BASE_URLS.ADMIN, subjectRoutes);
// app.use(BASE_URLS.ATTENDANCE, testRoutes);
app.use(BASE_URLS.USER, userRoutes);

// Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
