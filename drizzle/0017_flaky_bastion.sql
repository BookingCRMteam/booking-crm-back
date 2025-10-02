ALTER TABLE "tours" DROP CONSTRAINT "tours_departure_city_id_cities_id_fk";
--> statement-breakpoint
ALTER TABLE "tours" DROP CONSTRAINT "tours_departure_country_iso2_code_countries_iso2_fk";
--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "adults";--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "children";--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "pets_allowed";--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "departure_city_id";--> statement-breakpoint
ALTER TABLE "tours" DROP COLUMN "departure_country_iso2_code";