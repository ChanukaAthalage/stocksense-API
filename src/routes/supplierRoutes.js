import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

const router = Router();

// POST / - Create supplier (admin only)
router.post("/", protect, authorizeRoles("admin"), createSupplier);

// GET / - Get all active suppliers (admin, warehouse_manager)
router.get("/", protect, authorizeRoles("admin", "warehouse_manager"), getSuppliers);

// GET /:id - Get supplier by ID (admin, warehouse_manager)
router.get("/:id", protect, authorizeRoles("admin", "warehouse_manager"), getSupplierById);

// PUT /:id - Update supplier (admin only)
router.put("/:id", protect, authorizeRoles("admin"), updateSupplier);

// DELETE /:id - Soft delete supplier (admin only)
router.delete("/:id", protect, authorizeRoles("admin"), deleteSupplier);

export default router;
