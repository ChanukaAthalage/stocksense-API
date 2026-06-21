import mongoose from "mongoose";
import Warehouse from "../models/Warehouse.js";
import validateManager from "../utils/validateManager.js";

// Create a new warehouse (admin only)
export const createWarehouse = async (req, res) => {
  try {
    const { name, location, contactEmail, contactPhone, managerId } = req.body;

    if (!name || !location || !contactEmail || !contactPhone || !managerId) {
      return res.status(400).json({
        success: false,
        message:
          "Name, location, contact email, contact phone, and manager are required",
      });
    }

    const managerCheck = await validateManager(managerId);
    if (!managerCheck.valid) {
      return res.status(managerCheck.status).json({
        success: false,
        message: managerCheck.message,
      });
    }

    const warehouse = await Warehouse.create({
      name,
      location,
      contactEmail,
      contactPhone,
      managerId,
    });

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      warehouse,
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
      message: "An error occurred during warehouse creation",
    });
  }
};

// Get all active warehouses (all roles)
export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true }).populate(
      "managerId",
      "name email",
    );

    return res.status(200).json({
      success: true,
      message: "Warehouses retrieved successfully",
      count: warehouses.length,
      warehouses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving warehouses",
    });
  }
};

// Get a single warehouse by ID (all roles)
export const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid warehouse ID format",
      });
    }

    const warehouse = await Warehouse.findOne({
      _id: id,
      isActive: true,
    }).populate("managerId", "name email");

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse retrieved successfully",
      warehouse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the warehouse",
    });
  }
};

// Update warehouse details (admin only)
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, contactEmail, contactPhone, managerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid warehouse ID format",
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (managerId !== undefined) {
      const managerCheck = await validateManager(managerId);
      if (!managerCheck.valid) {
        return res.status(managerCheck.status).json({
          success: false,
          message: managerCheck.message,
        });
      }
      updateData.managerId = managerId;
    }

    const warehouse = await Warehouse.findOneAndUpdate(
      { _id: id, isActive: true },
      updateData,
      { new: true, runValidators: true },
    ).populate("managerId", "name email");

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      warehouse,
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
      message: "An error occurred while updating the warehouse",
    });
  }
};

// Update warehouse contact details only (admin/manager)
export const updateWarehouseContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { contactEmail, contactPhone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid warehouse ID format",
      });
    }

    if (!contactEmail && !contactPhone) {
      return res.status(400).json({
        success: false,
        message: "At least one of contactEmail or contactPhone is required",
      });
    }

    const updateData = {};
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;

    const filter = { _id: id, isActive: true };
    if (req.user.role === 'warehouse_manager') {
      filter.managerId = req.user._id;
    }

    const warehouse = await Warehouse.findOneAndUpdate(
      filter,
      updateData,
      { new: true, runValidators: true },
    ).populate("managerId", "name email");

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse contact details updated successfully",
      warehouse,
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
      message: "An error occurred while updating warehouse contact details",
    });
  }
};

// Soft delete a warehouse (admin only)
export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid warehouse ID format",
      });
    }

    const warehouse = await Warehouse.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully",
      warehouse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the warehouse",
    });
  }
};
