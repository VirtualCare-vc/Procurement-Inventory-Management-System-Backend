import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pms.local' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@pms.local',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const supplier = await prisma.supplier.create({
    data: {
      name: 'ABC Supplies',
      contact: '0300-1234567',
      email: 'abc@supplier.com',
      address: 'Karachi, Pakistan',
    },
  });

  const product = await prisma.product.create({
    data: {
      sku: 'P-1001',
      name: 'LED Bulb 12W',
      unitPrice: 250,
      description: 'Energy-saving LED bulb',
      variants: {
        create: [
          {
            barcode: 'LED-001',
            attributes: { color: 'white', size: '12W' },
            qtyOnHand: 50,
          },
        ],
      },
    },
    include: { variants: true },
  });

  console.log('✅ Seeding complete!');
  console.table({ admin: admin.email, supplier: supplier.name, product: product.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
