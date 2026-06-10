-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customer_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customer_phone" TEXT NOT NULL DEFAULT '';
