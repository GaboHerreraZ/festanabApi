import { IProduct, Product } from "../model/inventory.model";

const getAllInventory = async () => {
  return await Product.find();
};

const addNewItemToInventory = async (
  name: string,
  quantity: number,
  rentalPrice: number
) => {
  const newProduct = new Product({ name, quantity, rentalPrice });
  return await newProduct.save();
};

const updateInventoryItem = async (product: IProduct) => {
  return await Product.findByIdAndUpdate(product._id, product, {
    new: true,
    runValidators: true,
  });
};

export { getAllInventory, addNewItemToInventory, updateInventoryItem };
