-- This migration drops the dates_check constraint from the tours table.
ALTER TABLE "tours" DROP CONSTRAINT IF EXISTS "dates_check";
