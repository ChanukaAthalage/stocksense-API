import express from "express";
import authRoutes from "./authRoutes.js";
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply strict rate limiting to authentication routes
router.use("/auth", authLimiter, authRoutes);

export default router;
