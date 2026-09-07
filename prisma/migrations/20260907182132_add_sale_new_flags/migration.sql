-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "compareAtPrice" DOUBLE PRECISION,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false;
