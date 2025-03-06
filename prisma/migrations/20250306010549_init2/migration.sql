/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "SalesDetail" DROP CONSTRAINT "SalesDetail_product_id_fkey";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Product_id_seq";

-- AlterTable
ALTER TABLE "SalesDetail" ALTER COLUMN "product_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "SalesDetail" ADD CONSTRAINT "SalesDetail_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
