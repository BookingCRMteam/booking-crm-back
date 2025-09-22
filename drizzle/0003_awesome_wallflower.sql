ALTER TABLE "tour_photos" ADD COLUMN "is_main" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tour_photos" ADD COLUMN "description" text;