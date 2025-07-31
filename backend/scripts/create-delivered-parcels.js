const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDeliveredParcels() {
  try {
    // Get existing parcels
    const parcels = await prisma.parcel.findMany({
      take: 3 // Get first 3 parcels
    });

    console.log(`Found ${parcels.length} parcels`);

    // Update parcels to DELIVERED status
    for (const parcel of parcels) {
      await prisma.parcel.update({
        where: { id: parcel.id },
        data: {
          currentStatus: 'DELIVERED'
        }
      });
      console.log(`Updated parcel ${parcel.id} to DELIVERED status`);
    }

    console.log('Successfully updated parcels to DELIVERED status');
  } catch (error) {
    console.error('Error updating parcels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDeliveredParcels(); 