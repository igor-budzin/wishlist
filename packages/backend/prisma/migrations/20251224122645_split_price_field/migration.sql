-- AlterTable
ALTER TABLE "wishlist_items" ADD COLUMN     "priceAmount" DECIMAL(65,30),
ADD COLUMN     "priceCurrency" TEXT;

-- CreateIndex
CREATE INDEX "wishlist_items_userId_priceAmount_idx" ON "wishlist_items"("userId", "priceAmount");
