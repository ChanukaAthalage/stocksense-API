import express from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";
import warehouseRoutes from "./warehouseRoutes.js";
import supplierRoutes from "./supplierRoutes.js";
import orderRoutes from "./orderRoutes.js";
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply strict rate limiting to authentication routes
router.use("/auth", authLimiter, authRoutes);

// Mount product routes
router.use("/products", productRoutes);

// Mount warehouse routes
router.use("/warehouses", warehouseRoutes);

// Mount supplier routes
router.use("/suppliers", supplierRoutes);

// Mount order routes
router.use("/orders", orderRoutes);

export default router;
