import mongoose from "mongoose";
import Product from "../models/Product.js";
import validateWarehouse from "../utils/validateWarehouse.js";

// Create a new product (warehouse_manager only)
export const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      category,
      quantity,
      reorderLevel,
      unitCost,
      unit,
      warehouseId,
      supplierId,
    } = req.body;

    // Validate required fields
    if (!sku || !name || !warehouseId) {
      return res.status(400).json({ message: "SKU, name, and warehouse are required" });
}

    const warehouseCheck = await validateWarehouse(warehouseId);
    if (!warehouseCheck.valid) {
      return res.status(warehouseCheck.status).json({
        success: false,
        message: warehouseCheck.message,
      });
    }

    // Create product
    const product = await Product.create({
      sku,
      name,
      description,
      category,
      quantity,
      reorderLevel,
      unitCost,
      unit,
      warehouseId,
      supplierId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
  // Handle duplicate SKU error
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Product SKU already exists",
    });
  }
  // Handle validation/cast errors (bad client input)
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  return res.status(500).json({
    success: false,
    message: "An error occurred during product creation",
  });
}
};

// Get all products (all roles) with optional category filter
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("warehouseId", "name")
      .populate("supplierId", "name");

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving products",
    });
  }
};

// Get low stock products (quantity <= reorderLevel)
export const getLowStock = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ["$quantity", "$reorderLevel"] },
    })
      .populate("warehouseId", "name")
      .populate("supplierId", "name");

    res.status(200).json({
      success: true,
      message: "Low stock products retrieved successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving low stock products",
    });
  }
};

// Get product by ID (all roles)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id)
      .populate("warehouseId", "name")
      .populate("supplierId", "name");

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the product",
    });
  }
};

// Update product details (warehouse_manager only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      reorderLevel,
      unitCost,
      unit,
      warehouseId,
      supplierId,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (reorderLevel !== undefined) updateData.reorderLevel = reorderLevel;
    if (unitCost !== undefined) updateData.unitCost = unitCost;
    if (unit !== undefined) updateData.unit = unit;
    if (warehouseId !== undefined) {
      const warehouseCheck = await validateWarehouse(warehouseId);
      if (!warehouseCheck.valid) {
        return res.status(warehouseCheck.status).json({
          success: false,
          message: warehouseCheck.message,
        });
      }
      updateData.warehouseId = warehouseId;
    }
    if (supplierId !== undefined) updateData.supplierId = supplierId;

    const product = await Product.findOneAndUpdate(
  { _id: id, isActive: true },  
  updateData,
  { new: true, runValidators: true },
)
      .populate("warehouseId", "name")
      .populate("supplierId", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, message: error.message });
  }
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the product",
    });
  }
};

// Update product stock (quantity only, warehouse_manager only)
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a non-negative number",
      });
    }

    const product = await Product.findOneAndUpdate(
  { _id: id, isActive: true },
  { quantity },
  { new: true, runValidators: true },
)
  .populate("warehouseId", "name")
  .populate("supplierId", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product stock updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, message: error.message });
  }
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating product stock",
    });
  }
};

// Delete product (soft delete, admin only)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findOneAndUpdate(
  { _id: id, isActive: true },
  { isActive: false },
  { new: true },
);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product",
    });
  }
};
