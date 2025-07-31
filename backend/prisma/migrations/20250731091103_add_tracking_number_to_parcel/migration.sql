/*
  Warnings:

  - A unique constraint covering the columns `[trackingNumber]` on the table `Parcel` will be added. If there are existing duplicate values, this will fail.
  - The required column `trackingNumber` was added to the `Parcel` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN "trackingNumber" TEXT;

-- Update existing records with unique tracking numbers
UPDATE "Parcel" SET "trackingNumber" = 'TRK-' || "id" WHERE "trackingNumber" IS NULL;

-- Make trackingNumber required
ALTER TABLE "Parcel" ALTER COLUMN "trackingNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_trackingNumber_key" ON "Parcel"("trackingNumber");
