import { Router } from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createProduct,
  getProducts,
  getLowStock,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
} from '../controllers/productController.js';

const router = Router();

// POST / - Create product (warehouse_manager, admin)
router.post('/', protect, authorizeRoles('warehouse_manager', 'admin'), createProduct);

// GET / - Get all products (warehouse_manager, supplier, admin)
router.get('/', protect, authorizeRoles('warehouse_manager', 'supplier', 'admin'), getProducts);

// GET /low-stock - Get low stock products (warehouse_manager, admin)
router.get('/low-stock', protect, authorizeRoles('warehouse_manager', 'admin'), getLowStock);

// GET /:id - Get product by ID (warehouse_manager, supplier, admin)
router.get('/:id', protect, authorizeRoles('warehouse_manager', 'supplier', 'admin'), getProductById);

// PUT /:id - Update product (warehouse_manager, admin)
router.put('/:id', protect, authorizeRoles('warehouse_manager', 'admin'), updateProduct);

// PATCH /:id/stock - Update product stock (warehouse_manager, admin)
router.patch('/:id/stock', protect, authorizeRoles('warehouse_manager', 'admin'), updateStock);

// DELETE /:id - Delete product (admin only)
router.delete('/:id', protect, authorizeRoles('admin'), deleteProduct);

export default router;
