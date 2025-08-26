ALTER TABLE "tours" DROP CONSTRAINT "tours_country_id_countries_id_fk";
--> statement-breakpoint
ALTER TABLE "tours" DROP CONSTRAINT "tours_city_id_cities_id_fk";
--> statement-breakpoint
ALTER TABLE "tours" DROP CONSTRAINT "tours_departure_city_id_cities_id_fk";
--> statement-breakpoint
ALTER TABLE "tours" DROP CONSTRAINT "tours_departure_country_id_countries_id_fk";
--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "country_iso2_code" varchar(2) NOT NULL DEFAULT 'UA';--> statement-breakpoint
ALTER TABLE "tours" ADD COLUMN "departure_country_iso2_code" varchar(2);--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "country_id";--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "departure_country_id";
