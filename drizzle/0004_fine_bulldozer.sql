ALTER TABLE "tour_photos" DROP CONSTRAINT "tour_photos_url_unique";--> statement-breakpoint
ALTER TABLE "tour_photos" ADD COLUMN "is_main" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tour_photos" ADD COLUMN "description" text;--> statement-breakpoint
CREATE UNIQUE INDEX "main_photo_idx" ON "tour_photos" USING btree ("tour_id") WHERE "is_main" = true;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_title_unique" UNIQUE("title");