import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";

const validateSupplier = async (supplierId) => {
  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    return { valid: false, status: 400, message: "Invalid supplier ID format" };
  }

  const supplier = await Supplier.findOne({ _id: supplierId, isActive: true }).lean();
  if (!supplier) {
    return { valid: false, status: 404, message: "Supplier not found" };
  }

  return { valid: true };
};

export default validateSupplier;
