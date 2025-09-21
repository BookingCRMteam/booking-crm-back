ALTER TABLE "tours" ADD CONSTRAINT "tours_title_unique" UNIQUE("title");--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "available_spots_check" CHECK ("available_spots" >= 0);