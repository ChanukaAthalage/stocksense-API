import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  updateWarehouseContact,
  deleteWarehouse,
} from "../controllers/warehouseController.js";

const router = Router();

// POST / - Create warehouse (admin only)
router.post("/", protect, authorizeRoles("admin"), createWarehouse);

// GET / - Get all warehouses (admin, warehouse_manager)
router.get("/", protect, authorizeRoles("admin", "warehouse_manager"), getWarehouses);

// GET /:id - Get warehouse by ID (admin, warehouse_manager)
router.get("/:id", protect, authorizeRoles("admin", "warehouse_manager"), getWarehouseById);

// PUT /:id - Update warehouse (admin only)
router.put("/:id", protect, authorizeRoles("admin"), updateWarehouse);

// PATCH /:id/contact - Update contact details (admin, warehouse_manager)
router.patch("/:id/contact", protect, authorizeRoles("admin", "warehouse_manager"), updateWarehouseContact);

// DELETE /:id - Soft delete warehouse (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteWarehouse);

export default router;
