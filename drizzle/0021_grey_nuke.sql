ALTER TABLE "bookings" ADD COLUMN "first_person_name" varchar(255);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "first_person_surname" varchar(255);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "second_person_name" varchar(255);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "second_person_surname" varchar(255);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "phone" varchar(20);