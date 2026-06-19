import mongoose from "mongoose";
import Warehouse from "../models/Warehouse.js";

const validateWarehouse = async (warehouseId) => {
  if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
    return { valid: false, status: 400, message: "Invalid warehouse ID format" };
  }

  const warehouse = await Warehouse.findOne({ _id: warehouseId, isActive: true }).lean();
  if (!warehouse) {
    return { valid: false, status: 404, message: "Warehouse not found" };
  }

  return { valid: true };
};

export default validateWarehouse;
