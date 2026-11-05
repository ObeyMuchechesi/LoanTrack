import LoanProduct from '../models/LoanProduct.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const FIELDS = [
  'name', 'segment', 'interestType', 'annualRate', 'frequency',
  'minAmount', 'maxAmount', 'processingFeePct', 'penaltyPctPerDay', 'active',
];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

export const list = asyncHandler(async (_req, res) => {
  const products = await LoanProduct.find().sort('segment name');
  res.json(products);
});

export const create = asyncHandler(async (req, res) => {
  const values = pick(req.body);
  if (!values.name || !String(values.name).trim())
    return res.status(400).json({ message: 'Product name is required' });
  if (values.minAmount !== undefined && values.maxAmount !== undefined &&
      Number(values.minAmount) > Number(values.maxAmount))
    return res.status(400).json({ message: 'Minimum amount cannot exceed maximum amount' });
  const product = await LoanProduct.create(values);
  res.status(201).json(product);
});

export const update = asyncHandler(async (req, res) => {
  const product = await LoanProduct.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});
