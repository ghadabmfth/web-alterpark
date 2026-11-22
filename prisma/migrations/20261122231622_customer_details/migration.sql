-- CreateEnum
CREATE TYPE "Civility" AS ENUM ('MME', 'M');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "civility" "Civility",
ADD COLUMN     "companyName" VARCHAR(120),
ADD COLUMN     "postalCode" VARCHAR(12);
