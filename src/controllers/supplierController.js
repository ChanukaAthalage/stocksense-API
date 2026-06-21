import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";

// Create a new supplier (admin only)
export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, location, leadTime } = req.body;

    if (!name || !phone || !email || !location || leadTime === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, email, location, and lead time are required",
      });
    }

    const supplier = await Supplier.create({ name, phone, email, location, leadTime });

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A supplier with this email already exists",
      });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "An error occurred during supplier creation",
    });
  }
};

// Get all active suppliers (admin, warehouse_manager)
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true });

    return res.status(200).json({
      success: true,
      message: "Suppliers retrieved successfully",
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving suppliers",
    });
  }
};

// Get a single supplier by ID (admin, warehouse_manager)
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID format",
      });
    }

    const supplier = await Supplier.findOne({ _id: id, isActive: true });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier retrieved successfully",
      supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the supplier",
    });
  }
};

// Full update of a supplier (admin only)
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, location, leadTime } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID format",
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (location !== undefined) updateData.location = location;
    if (leadTime !== undefined) updateData.leadTime = leadTime;

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, isActive: true },
      updateData,
      { new: true, runValidators: true },
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A supplier with this email already exists",
      });
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the supplier",
    });
  }
};

// Soft delete a supplier (admin only)
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID format",
      });
    }

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
      supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the supplier",
    });
  }
};
