import LoanProduct from '../models/LoanProduct.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (_req, res) => {
  const products = await LoanProduct.find().sort('segment name');
  res.json(products);
});

export const create = asyncHandler(async (req, res) => {
  const product = await LoanProduct.create(req.body);
  res.status(201).json(product);
});

export const update = asyncHandler(async (req, res) => {
  const product = await LoanProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});
