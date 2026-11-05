import dns from 'dns/promises';
import mongoose from 'mongoose';

// Some local/container resolvers refuse SRV queries (ECONNREFUSED), which makes
// mongodb+srv:// URIs unusable even though the Atlas hosts are reachable.
// Probe SRV first and only fall back to public resolvers when the default fails.
async function ensureSrvResolution(uri) {
  if (!uri.startsWith('mongodb+srv://')) return;

  const host = uri.split('@').pop().split('/')[0].split('?')[0];
  const srvName = `_mongodb._tcp.${host}`;

  try {
    await dns.resolveSrv(srvName);
  } catch (err) {
    console.warn(`SRV lookup via default resolver failed (${err.code || err.message}); using public DNS`);
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    await dns.resolveSrv(srvName);
  }
}

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  await ensureSrvResolution(uri);

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
  console.log('MongoDB connected');
}
