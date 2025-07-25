/*
  Warnings:

  - You are about to drop the column `currentStatusId` on the `Parcel` table. All the data in the column will be lost.
  - You are about to drop the `DeliveryStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DeliveryStatusEnum" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Parcel" DROP CONSTRAINT "Parcel_currentStatusId_fkey";

-- AlterTable
ALTER TABLE "Parcel" DROP COLUMN "currentStatusId",
ADD COLUMN     "currentStatus" "DeliveryStatusEnum" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "DeliveryStatus";
