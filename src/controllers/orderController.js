import mongoose from "mongoose";
import Order from "../models/Order.js";
import validateProduct from "../utils/validateProduct.js";
import validateSupplier from "../utils/validateSupplier.js";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const TRANSITIONS = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped:   ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

// Create a new order (warehouse_manager only)
export const createOrder = async (req, res) => {
  try {
    const { productId, supplierId, quantity } = req.body;

    if (!productId || !supplierId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product, supplier, and quantity are required",
      });
    }

    const productCheck = await validateProduct(productId);
    if (!productCheck.valid) {
      return res.status(productCheck.status).json({
        success: false,
        message: productCheck.message,
      });
    }

    const supplierCheck = await validateSupplier(supplierId);
    if (!supplierCheck.valid) {
      return res.status(supplierCheck.status).json({
        success: false,
        message: supplierCheck.message,
      });
    }

    const order = await Order.create({
      productId,
      supplierId,
      quantity,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "An error occurred during order creation",
    });
  }
};

// Get all active orders (admin, warehouse_manager)
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ isActive: true })
      .populate("productId", "name sku")
      .populate("supplierId", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving orders",
    });
  }
};

// Get a single order by ID (admin, warehouse_manager)
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findOne({ _id: id, isActive: true })
      .populate("productId", "name sku")
      .populate("supplierId", "name email")
      .populate("createdBy", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the order",
    });
  }
};

// Update order status only (warehouse_manager, admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const currentOrder = await Order.findOne({ _id: id, isActive: true });
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!TRANSITIONS[currentOrder.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition order from '${currentOrder.status}' to '${status}'`,
      });
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, isActive: true },
      { status },
      { new: true, runValidators: true },
    )
      .populate("productId", "name sku")
      .populate("supplierId", "name email")
      .populate("createdBy", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the order status",
    });
  }
};

// Soft delete an order (admin only)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID format",
      });
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the order",
    });
  }
};
