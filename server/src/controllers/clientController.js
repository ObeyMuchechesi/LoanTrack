import Client from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../utils/activity.js';

export const list = asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  const filter = {};
  if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { phone: new RegExp(q, 'i') }, { clientNo: new RegExp(q, 'i') }];
  if (type) filter.type = type;
  const clients = await Client.find(filter).sort('-createdAt').limit(200);
  res.json(clients);
});

export const get = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ message: 'Not found' });
  res.json(client);
});

export const create = asyncHandler(async (req, res) => {
  const client = await Client.create({ ...req.body, createdBy: req.user._id });
  await logActivity({ actor: req.user._id, action: 'client.create', entityType: 'Client', entityId: client._id });
  res.status(201).json(client);
});

export const update = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!client) return res.status(404).json({ message: 'Not found' });
  res.json(client);
});
