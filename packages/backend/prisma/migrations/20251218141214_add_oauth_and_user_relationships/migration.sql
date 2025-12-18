-- DropForeignKey (if exists - for safety)
-- AlterTable users - add OAuth fields
ALTER TABLE "users" ADD COLUMN "provider" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "providerId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "avatar" TEXT;

-- Delete existing wishlist items (development data only)
DELETE FROM "wishlist_items";

-- AlterTable wishlist_items - add userId
ALTER TABLE "wishlist_items" ADD COLUMN "userId" TEXT NOT NULL;

-- CreateIndex on wishlist_items
CREATE INDEX "wishlist_items_userId_idx" ON "wishlist_items"("userId");

-- CreateIndex unique constraint on users
CREATE UNIQUE INDEX "users_provider_providerId_key" ON "users"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove default values (they were only needed for the ALTER)
ALTER TABLE "users" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "providerId" DROP DEFAULT;
