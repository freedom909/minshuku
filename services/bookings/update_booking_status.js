import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  try {
    // Update bookings with checkOutDate before today's date to status COMPLETED
    const completedBookings = await prisma.booking.updateMany({
      where: {
        OR: [{ status: 'UPCOMING' }, { status: 'CURRENT' }],
        checkOutDate: {
          lt: new Date(),
        },
      },
      data: {
        status: 'COMPLETED',
      },
    });
    if (completedBookings.count > 0) {
      console.log(`Bookings DB: successfully updated booking status of ${completedBookings.count} rows to COMPLETED`);
    }

    // Update bookings where today's date falls within checkInDate and checkOutDate range to status CURRENT
    const currentBookings = await prisma.booking.updateMany({
      where: {
        status: 'UPCOMING',
        checkInDate: { lt: new Date() },
        checkOutDate: { gt: new Date() },
      },
      data: {
        status: 'CURRENT',
      },
    });
    if (currentBookings.count > 0) {
      console.log(`Bookings DB: successfully updated booking status of ${currentBookings.count} rows to CURRENT`);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();

await prisma.$disconnect();


