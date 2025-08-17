ALTER TABLE "operators" RENAME COLUMN "contact_person" TO "first_name";--> statement-breakpoint
ALTER TABLE "operators" ADD COLUMN "last_name" text NOT NULL;