/**
 * Seed script: creates an admin user.
 * Run: npx ts-node src/seed.ts
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not set');

  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    console.error(
      'ADMIN_SEED_PASSWORD is not set. Refusing to seed an admin with a default password.\n' +
        'Set ADMIN_SEED_PASSWORD in your environment (or backend/.env) and re-run.',
    );
    process.exit(1);
    return;
  }
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@boipora.com';

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('DB not connected');
  const users = db.collection('users');
  const existing = await users.findOne({ email: adminEmail });
  if (existing) {
    console.log('Admin user already exists');
    await mongoose.disconnect();
    process.exit(0);
    return;
  }
  const hash = await bcrypt.hash(adminPassword, 12);
  await users.insertOne({
    email: adminEmail,
    passwordHash: hash,
    name: 'Admin',
    role: 'admin',
    authProvider: 'local',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(
    `Admin user created: ${adminEmail} (password from ADMIN_SEED_PASSWORD)`,
  );
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
