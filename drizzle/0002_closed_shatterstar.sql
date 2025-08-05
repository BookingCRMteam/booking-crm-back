CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"country_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "countries_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tour_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"url" varchar(255) NOT NULL,
	CONSTRAINT "tour_photos_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"country_id" integer NOT NULL,
	"city_id" integer,
	"type" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'UAH',
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"available_spots" integer NOT NULL,
	"conditions" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"pets_allowed" boolean DEFAULT false NOT NULL,
	"departure_city_id" integer,
	"departure_country_id" integer
);
--> statement-breakpoint
DROP TABLE "health" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_departure_city_id_cities_id_fk" FOREIGN KEY ("departure_city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_departure_country_id_countries_id_fk" FOREIGN KEY ("departure_country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;