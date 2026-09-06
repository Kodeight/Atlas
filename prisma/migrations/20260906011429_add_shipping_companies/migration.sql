-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryType" TEXT NOT NULL DEFAULT 'home',
ADD COLUMN     "shippingCompany" TEXT;

-- CreateTable
CREATE TABLE "ShippingCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingCompany_name_key" ON "ShippingCompany"("name");
