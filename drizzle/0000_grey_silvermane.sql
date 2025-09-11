CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tour_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending_payment' NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"payment_provider" varchar(20),
	"payment_session_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_iso2" char(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "city_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"language_code" varchar(5) NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "city_translations_city_id_language_code_unique" UNIQUE("city_id","language_code")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"iso2" char(2) NOT NULL,
	"iso3" char(3) NOT NULL,
	CONSTRAINT "countries_iso2_unique" UNIQUE("iso2"),
	CONSTRAINT "countries_iso3_unique" UNIQUE("iso3")
);
--> statement-breakpoint
CREATE TABLE "country_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_iso2" char(2) NOT NULL,
	"language_code" varchar(5) NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "country_translations_country_iso2_language_code_unique" UNIQUE("country_iso2","language_code")
);
--> statement-breakpoint
CREATE TABLE "health" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "health_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "operators" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"description" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"website" text NOT NULL,
	"phone" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"philosophy" text,
	"photo" text,
	CONSTRAINT "operators_email_unique" UNIQUE("email"),
	CONSTRAINT "operators_user_id_unique" UNIQUE("user_id")
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
	"country_iso2_code" char(2) DEFAULT 'UA' NOT NULL,
	"city_id" integer,
	"type" varchar(100),
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'UAH',
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"available_spots" integer NOT NULL,
	"conditions" text,
	"is_active" boolean DEFAULT true,
	"adults" integer DEFAULT 1 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"pets_allowed" boolean DEFAULT false NOT NULL,
	"departure_city_id" integer,
	"departure_country_iso2_code" char(2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"sub" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"operator_id" integer,
	"first_person_name" text,
	"first_person_surname" text,
	"second_person_name" text,
	"second_person_surname" text,
	"phone" text,
	"role" text DEFAULT 'traveler' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_sub_unique" UNIQUE("sub")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_iso2_countries_iso2_fk" FOREIGN KEY ("country_iso2") REFERENCES "public"."countries"("iso2") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_translations" ADD CONSTRAINT "city_translations_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "country_translations" ADD CONSTRAINT "country_translations_country_iso2_countries_iso2_fk" FOREIGN KEY ("country_iso2") REFERENCES "public"."countries"("iso2") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operators" ADD CONSTRAINT "operators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_photos" ADD CONSTRAINT "tour_photos_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_country_iso2_code_countries_iso2_fk" FOREIGN KEY ("country_iso2_code") REFERENCES "public"."countries"("iso2") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tours" ADD CONSTRAINT "tours_departure_city_id_cities_id_fk" FOREIGN KEY ("departure_city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE cascade;