-- CreateTable
CREATE TABLE `booking` (
    `_id` VARCHAR(191) NOT NULL,
    `guestId` VARCHAR(191) NOT NULL,
    `checkInDate` DATETIME(3) NOT NULL,
    `checkOutDate` DATETIME(3) NOT NULL,
    `totalCost` DOUBLE NOT NULL,
    `listingId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
