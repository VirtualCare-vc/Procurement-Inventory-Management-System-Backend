// const { PrismaClient } = require('../generated/prisma')
// const prisma = new PrismaClient();

// async function main() {
//   await prisma.role.createMany({
//     data: [
//       { name: 'Super Admin' },
//       { name: 'Tenant Admin' },
//       { name: 'Company Admin' },
//     ],
//     skipDuplicates: true,
//   });
// }

// main()
//   .catch(e => console.error(e))
//   .finally(async () => await prisma.$disconnect());

const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient();

async function main() {
  const roles = ['Super Admin', 'Admin', 'User'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}
main().finally(() => prisma.$disconnect());
