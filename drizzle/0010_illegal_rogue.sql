ALTER TABLE "users" RENAME COLUMN "password_hash" TO "first_person_name";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "firstName" TO "second_person_name";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "lastName" TO "second_person_surame";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_person_surame" text;