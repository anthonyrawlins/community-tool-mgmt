import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await hashPassword('admin123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ballarattoolibrary.org.au' },
    update: {},
    create: {
      email: 'admin@ballarattoolibrary.org.au',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      phone: '03 5331 1234',
      address: '123 Main Street',
      suburb: 'Ballarat',
      postcode: '3350',
      state: 'VIC',
      isActive: true,
      emailVerified: true
    }
  });

  // Create volunteer user
  const volunteerPassword = await hashPassword('volunteer123!');
  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer@ballarattoolibrary.org.au' },
    update: {},
    create: {
      email: 'volunteer@ballarattoolibrary.org.au',
      password: volunteerPassword,
      firstName: 'Jane',
      lastName: 'Volunteer',
      role: 'VOLUNTEER',
      phone: '03 5331 5678',
      address: '456 Community Street',
      suburb: 'Ballarat East',
      postcode: '3350',
      state: 'VIC',
      isActive: true,
      emailVerified: true
    }
  });

  // Create sample member users
  const memberPassword = await hashPassword('member123!');
  const member1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: memberPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'MEMBER',
      phone: '0412 345 678',
      address: '789 Residential Street',
      suburb: 'Ballarat North',
      postcode: '3350',
      state: 'VIC',
      isActive: true,
      emailVerified: true
    }
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'sarah.smith@example.com' },
    update: {},
    create: {
      email: 'sarah.smith@example.com',
      password: memberPassword,
      firstName: 'Sarah',
      lastName: 'Smith',
      role: 'MEMBER',
      phone: '0423 456 789',
      address: '321 Garden Lane',
      suburb: 'Sebastopol',
      postcode: '3356',
      state: 'VIC',
      isActive: true,
      emailVerified: true
    }
  });

  // Create memberships
  const member1Membership = await prisma.member.upsert({
    where: { userId: member1.id },
    update: {},
    create: {
      userId: member1.id,
      membershipNumber: 'BTL001',
      tier: 'BASIC',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      maxLoans: 3,
      maxReservations: 2,
      isActive: true
    }
  });

  const member2Membership = await prisma.member.upsert({
    where: { userId: member2.id },
    update: {},
    create: {
      userId: member2.id,
      membershipNumber: 'BTL002',
      tier: 'PREMIUM',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      maxLoans: 5,
      maxReservations: 4,
      isActive: true
    }
  });

  // Create tool categories
  const powerToolsCategory = await prisma.toolCategory.upsert({
    where: { name: 'Power Tools' },
    update: {},
    create: {
      name: 'Power Tools',
      description: 'Electric and battery-powered tools for construction and DIY projects'
    }
  });

  const handToolsCategory = await prisma.toolCategory.upsert({
    where: { name: 'Hand Tools' },
    update: {},
    create: {
      name: 'Hand Tools',
      description: 'Manual tools for precision work and general use'
    }
  });

  const gardenToolsCategory = await prisma.toolCategory.upsert({
    where: { name: 'Garden Tools' },
    update: {},
    create: {
      name: 'Garden Tools',
      description: 'Tools for gardening, landscaping, and outdoor maintenance'
    }
  });

  // Create subcategories
  const drillsCategory = await prisma.toolCategory.upsert({
    where: { name: 'Drills' },
    update: {},
    create: {
      name: 'Drills',
      description: 'Cordless and corded drills for drilling and driving',
      parentId: powerToolsCategory.id
    }
  });

  const sawsCategory = await prisma.toolCategory.upsert({
    where: { name: 'Saws' },
    update: {},
    create: {
      name: 'Saws',
      description: 'Various types of power saws',
      parentId: powerToolsCategory.id
    }
  });

  // Create sample tools
  const cordlessDrill = await prisma.tool.upsert({
    where: { name: 'Makita 18V Cordless Drill' },
    update: {},
    create: {
      name: 'Makita 18V Cordless Drill',
      description: 'Professional 18V cordless drill with 2 batteries and charger',
      brand: 'Makita',
      model: 'DHP484Z',
      serialNumber: 'MKT001',
      barcode: '123456789001',
      categoryId: drillsCategory.id,
      condition: 'EXCELLENT',
      status: 'AVAILABLE',
      location: 'Shelf A1',
      purchaseDate: new Date('2023-01-15'),
      purchasePrice: 299.99,
      replacementValue: 350.00,
      loanPeriodDays: 7,
      maxLoanDays: 14,
      requiresDeposit: false,
      instructions: 'Always wear safety glasses. Charge batteries fully before use.',
      safetyNotes: 'High-speed rotating parts. Keep fingers away from chuck.',
      isActive: true
    }
  });

  const circularSaw = await prisma.tool.upsert({
    where: { name: 'DeWalt Circular Saw' },
    update: {},
    create: {
      name: 'DeWalt Circular Saw',
      description: '184mm circular saw with laser guide',
      brand: 'DeWalt',
      model: 'DWE575K',
      serialNumber: 'DWT001',
      barcode: '123456789002',
      categoryId: sawsCategory.id,
      condition: 'GOOD',
      status: 'AVAILABLE',
      location: 'Shelf B2',
      purchaseDate: new Date('2023-02-20'),
      purchasePrice: 189.99,
      replacementValue: 220.00,
      loanPeriodDays: 7,
      maxLoanDays: 10,
      requiresDeposit: true,
      depositAmount: 50.00,
      instructions: 'Use appropriate blade for material. Ensure workpiece is properly secured.',
      safetyNotes: 'DANGER: Sharp rotating blade. Always wear safety glasses and hearing protection.',
      isActive: true
    }
  });

  const hammerDrill = await prisma.tool.upsert({
    where: { name: 'Bosch SDS Hammer Drill' },
    update: {},
    create: {
      name: 'Bosch SDS Hammer Drill',
      description: 'Professional SDS hammer drill for masonry and concrete',
      brand: 'Bosch',
      model: 'GBH 2-28 F',
      serialNumber: 'BSH001',
      barcode: '123456789003',
      categoryId: drillsCategory.id,
      condition: 'EXCELLENT',
      status: 'AVAILABLE',
      location: 'Shelf A2',
      purchaseDate: new Date('2023-03-10'),
      purchasePrice: 449.99,
      replacementValue: 500.00,
      loanPeriodDays: 7,
      maxLoanDays: 14,
      requiresDeposit: true,
      depositAmount: 100.00,
      instructions: 'Use only SDS bits. Apply steady pressure, let the tool do the work.',
      safetyNotes: 'Heavy tool with powerful hammer action. Secure workpiece and wear PPE.',
      isActive: true
    }
  });

  // Create garden tools
  const lawnMower = await prisma.tool.upsert({
    where: { name: 'Honda Self-Propelled Mower' },
    update: {},
    create: {
      name: 'Honda Self-Propelled Mower',
      description: '21" self-propelled petrol lawn mower with mulching capability',
      brand: 'Honda',
      model: 'HRX217VKA',
      serialNumber: 'HND001',
      barcode: '123456789004',
      categoryId: gardenToolsCategory.id,
      condition: 'GOOD',
      status: 'AVAILABLE',
      location: 'Shed Area A',
      purchaseDate: new Date('2023-01-25'),
      purchasePrice: 899.99,
      replacementValue: 950.00,
      loanPeriodDays: 7,
      maxLoanDays: 7,
      requiresDeposit: true,
      depositAmount: 200.00,
      instructions: 'Check oil and fuel before use. Empty fuel tank before return.',
      safetyNotes: 'Rotating blade hazard. Never remove safety guards. Stop engine before adjustments.',
      isActive: true
    }
  });

  // Create system configuration
  await prisma.systemConfig.upsert({
    where: { key: 'library_name' },
    update: {},
    create: {
      key: 'library_name',
      value: 'Ballarat Tool Library',
      description: 'Name of the tool library organization'
    }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'contact_email' },
    update: {},
    create: {
      key: 'contact_email',
      value: 'info@ballarattoolibrary.org.au',
      description: 'Main contact email address'
    }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'late_fee_per_day' },
    update: {},
    create: {
      key: 'late_fee_per_day',
      value: '2.00',
      description: 'Late fee charged per day in AUD'
    }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'basic_membership_fee' },
    update: {},
    create: {
      key: 'basic_membership_fee',
      value: '55.00',
      description: 'Basic membership annual fee in AUD (excluding GST)'
    }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'premium_membership_fee' },
    update: {},
    create: {
      key: 'premium_membership_fee',
      value: '70.00',
      description: 'Premium membership annual fee in AUD (excluding GST)'
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Seeded data summary:');
  console.log(`👥 Users created: 4`);
  console.log(`🏷️  Categories created: 5`);
  console.log(`🛠️  Tools created: 4`);
  console.log(`👑 Memberships created: 2`);
  console.log(`⚙️  System configs created: 5`);
  console.log('\n🔑 Login credentials:');
  console.log('Admin: admin@ballarattoolibrary.org.au / admin123!');
  console.log('Volunteer: volunteer@ballarattoolibrary.org.au / volunteer123!');
  console.log('Member 1: john.doe@example.com / member123!');
  console.log('Member 2: sarah.smith@example.com / member123!');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });