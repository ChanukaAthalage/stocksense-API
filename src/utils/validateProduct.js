import mongoose from "mongoose";
import Product from "../models/Product.js";

const validateProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return { valid: false, status: 400, message: "Invalid product ID format" };
  }

  const product = await Product.findOne({ _id: productId, isActive: true }).lean();
  if (!product) {
    return { valid: false, status: 404, message: "Product not found" };
  }

  return { valid: true };
};

export default validateProduct;
