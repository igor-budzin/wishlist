import { PrismaClient, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  await prisma.wishlistItem.deleteMany();
  console.log('  Cleared existing wishlist items');

  // Create sample wishlist items
  const items = await Promise.all([
    prisma.wishlistItem.create({
      data: {
        title: 'New Laptop',
        description: 'MacBook Pro 16" for development work',
        url: 'https://www.apple.com/macbook-pro/',
        priority: Priority.HIGH,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        title: 'Mechanical Keyboard',
        description: 'Ergonomic keyboard with Cherry MX Brown switches',
        url: 'https://www.keychron.com/',
        priority: Priority.MEDIUM,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        title: 'Standing Desk',
        description: 'Adjustable height desk for better posture',
        priority: Priority.MEDIUM,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        title: 'Noise-Cancelling Headphones',
        description: 'Sony WH-1000XM5 for focused work sessions',
        url: 'https://www.sony.com/electronics/headband-headphones/wh-1000xm5',
        priority: Priority.HIGH,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        title: 'Monitor Arm',
        description: 'Dual monitor mount for desk setup',
        priority: Priority.LOW,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        title: 'USB-C Hub',
        description: 'Multi-port hub with HDMI, USB 3.0, and SD card reader',
        priority: Priority.MEDIUM,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        title: 'External SSD',
        description: 'Samsung T7 1TB for backups and extra storage',
        url: 'https://www.samsung.com/us/computing/memory-storage/portable-solid-state-drives/',
        priority: Priority.LOW,
      },
    }),
    prisma.wishlistItem.create({
      data: {
        title: 'Webcam',
        description: 'Logitech 4K webcam for video calls',
        priority: Priority.LOW,
      },
    }),
  ]);

  console.log(`  ✅ Created ${items.length} wishlist items`);
  console.log('🌱 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
