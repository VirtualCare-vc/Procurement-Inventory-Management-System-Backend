// test-db.js
const { PrismaClient } = require('../generated/prisma')

const prisma = new PrismaClient()

async function test() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
}

test()