/**
 * Seed script: creates an admin user.
 * Run: npx ts-node src/seed.ts
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boi-pora';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('DB not connected');
  const users = db.collection('users');
  const existing = await users.findOne({ email: 'admin@boipora.com' });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
    return;
  }
  const hash = await bcrypt.hash('admin123', 12);
  await users.insertOne({
    email: 'admin@boipora.com',
    passwordHash: hash,
    name: 'Admin',
    role: 'admin',
    authProvider: 'local',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('Admin user created: admin@boipora.com / admin123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
