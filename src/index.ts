import express from "express";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import noCache from "nocache";
import helmet from "helmet";
import { connectDatabase } from "./database/sequelize";

const app = express();
const port = process.env.PORT || 3000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

// Middleware setup
app.use(limiter);

app.use(cors());
app.use(noCache());
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// API routes
// app.use("/api/V1", routes);

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 API available at http://localhost:${port}/api`);
      console.log(`🏥 Health check at http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
