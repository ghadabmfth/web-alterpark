-- CreateEnum
CREATE TYPE "ReservationPaymentMethod" AS ENUM ('ONLINE', 'ON_SITE');

-- CreateEnum
CREATE TYPE "OnSitePaymentMethod" AS ENUM ('CARD', 'CASH', 'HOLIDAY_VOUCHERS', 'CHECK');

-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'ON_SITE';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "onSiteMethod" "OnSitePaymentMethod",
ADD COLUMN     "recordedById" UUID;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "paymentMethod" "ReservationPaymentMethod" NOT NULL DEFAULT 'ONLINE';
