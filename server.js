import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import routes from "./src/routes/index.js";
import { generalLimiter } from './src/middleware/rateLimiter.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET environment variable is not defined');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to restrict allowed origins via environment variable.
// Set `ALLOWED_ORIGINS` to a comma-separated list of allowed client origins,
// e.g. "https://app.example.com,https://admin.example.com".
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser or same-origin requests with no Origin header (e.g., curl, mobile apps)
    if (!origin) return callback(null, true);
    // If no allowed origins configured, allow all but log a warning
    if (allowedOrigins.length === 0) {
      console.warn('Warning: ALLOWED_ORIGINS is not set — allowing all origins');
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
// Apply a general rate limit to all incoming requests
app.use(generalLimiter);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check route that returns status ok and timestamp
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Connect to MongoDB
await connectDB();

// Routes
app.use("/api/v1", routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
