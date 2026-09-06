-- Baseline migration for the Atlas PostgreSQL (Neon) database.
-- Generated from the current Prisma schema with the PostgreSQL provider:
--   prisma migrate diff --from-empty --to-schema-datamodel <schema with provider="postgresql"> --script
-- Non-destructive: CREATE TABLE / CREATE INDEX / ADD CONSTRAINT only.
-- Models: AdminUser, Product, Order, OrderItem (flat product fields, no extra models).

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pfp" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flavor" TEXT,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "color" TEXT,
    "bgGradient" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
