/**
 * Seed Script: Create Super Admin User
 * Run: node scripts/create-super-admin.js
 *
 * This script:
 * 1. Creates an auth user in Supabase (bypassing email confirmation)
 * 2. Creates the corresponding User + Profile record in the database with SUPER_ADMIN role
 */

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://ypanqzdvcgdnkghphpzr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Pass via env

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@maximus.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Maximus123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Super Admin';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '';
// ─────────────────────────────────────────────────────────────────────────────

if (!SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Missing SUPABASE_SERVICE_KEY');
  console.error('Run as: SUPABASE_SERVICE_KEY=your_key node scripts/create-super-admin.js\n');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function createSuperAdmin() {
  console.log('\n🚀 Creating Super Admin...\n');
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Name     : ${ADMIN_NAME}`);
  console.log(`   Role     : SUPER_ADMIN\n`);

  try {
    // ── Step 1: Create Supabase Auth user ───────────────────────────────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,           // skip email confirmation
      user_metadata: {
        full_name: ADMIN_NAME,
        phone: ADMIN_PHONE,
        role: 'SUPER_ADMIN',
      },
    });

    if (authError) {
      // If user already exists in auth, try to fetch their ID
      if (authError.message?.toLowerCase().includes('already')) {
        console.warn('⚠️  Auth user already exists — looking up existing user...');
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users?.find(u => u.email === ADMIN_EMAIL);
        if (!existing) throw new Error('Could not find existing auth user.');
        authData = { user: existing };
      } else {
        throw authError;
      }
    }

    const authUser = authData.user;
    console.log(`✅ Supabase auth user created: ${authUser.id}`);

    // ── Step 2: Upsert DB User record ───────────────────────────────────────
    const existingUser = await prisma.user.findUnique({ where: { id: authUser.id } });

    if (existingUser) {
      // Update existing user to SUPER_ADMIN
      await prisma.user.update({
        where: { id: authUser.id },
        data: { role: 'SUPER_ADMIN' },
      });
      console.log('✅ Existing DB user updated to SUPER_ADMIN');
    } else {
      // Create new user with profile
      await prisma.user.create({
        data: {
          id: authUser.id,
          email: ADMIN_EMAIL,
          role: 'SUPER_ADMIN',
          profile: {
            create: {
              name: ADMIN_NAME,
              phone: ADMIN_PHONE || null,
            },
          },
        },
      });
      console.log('✅ New DB user + profile created with SUPER_ADMIN role');
    }

    console.log('\n🎉 Super Admin ready!\n');
    console.log('┌────────────────────────────────────────┐');
    console.log('│  Login at: http://localhost:3001/login  │');
    console.log(`│  Email   : ${ADMIN_EMAIL.padEnd(29)}│`);
    console.log(`│  Password: ${ADMIN_PASSWORD.padEnd(29)}│`);
    console.log('└────────────────────────────────────────┘\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
