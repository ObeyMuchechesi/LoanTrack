import Client from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../utils/activity.js';

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FIELDS = ['type', 'name', 'phone', 'email', 'nationalId', 'address', 'members', 'kycStatus', 'branch'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

export const list = asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { clientNo: rx }];
  }
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
  if (!req.body?.name || !String(req.body.name).trim())
    return res.status(400).json({ message: 'Client name is required' });
  const client = await Client.create({ ...pick(req.body), createdBy: req.user._id });
  await logActivity({ actor: req.user._id, action: 'client.create', entityType: 'Client', entityId: client._id });
  res.status(201).json(client);
});

export const update = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!client) return res.status(404).json({ message: 'Not found' });
  res.json(client);
});
