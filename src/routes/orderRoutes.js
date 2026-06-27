import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = Router();

// POST / - Create order (warehouse_manager only)
router.post("/", protect, authorizeRoles("warehouse_manager"), createOrder);

// GET / - Get all orders (admin, warehouse_manager)
router.get("/", protect, authorizeRoles("admin", "warehouse_manager"), getOrders);

// GET /:id - Get order by ID (admin, warehouse_manager)
router.get("/:id", protect, authorizeRoles("admin", "warehouse_manager"), getOrderById);

// PATCH /:id/status - Update order status (warehouse_manager, admin)
router.patch("/:id/status", protect, authorizeRoles("warehouse_manager", "admin"), updateOrderStatus);

// DELETE /:id - Soft delete order (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteOrder);

export default router;
