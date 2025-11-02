UPDATE "bookings" SET "first_person_name" = '' WHERE "first_person_name" IS NULL;
ALTER TABLE "bookings" ALTER COLUMN "first_person_name" SET NOT NULL;--> statement-breakpoint
UPDATE "bookings" SET "first_person_surname" = '' WHERE "first_person_surname" IS NULL;
ALTER TABLE "bookings" ALTER COLUMN "first_person_surname" SET NOT NULL;--> statement-breakpoint
UPDATE "bookings" SET "second_person_name" = '' WHERE "second_person_name" IS NULL;
ALTER TABLE "bookings" ALTER COLUMN "second_person_name" SET NOT NULL;--> statement-breakpoint
UPDATE "bookings" SET "second_person_surname" = '' WHERE "second_person_surname" IS NULL;
ALTER TABLE "bookings" ALTER COLUMN "second_person_surname" SET NOT NULL;--> statement-breakpoint
UPDATE "bookings" SET "phone" = '+000000000000' WHERE "phone" IS NULL;
ALTER TABLE "bookings" ALTER COLUMN "phone" SET NOT NULL;