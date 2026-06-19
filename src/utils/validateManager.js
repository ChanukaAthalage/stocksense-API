import mongoose from "mongoose";
import User from "../models/User.js";

const validateManager = async (managerId) => {
  if (!mongoose.Types.ObjectId.isValid(managerId)) {
    return { valid: false, status: 400, message: "Invalid manager ID format" };
  }

  const manager = await User.findOne({ _id: managerId, role: "warehouse_manager", isActive: true }).lean();
  if (!manager) {
    return {
      valid: false,
      status: 404,
      message: "Manager not found or user is not a warehouse manager",
    };
  }

  return { valid: true };
};

export default validateManager;
