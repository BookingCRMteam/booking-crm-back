CREATE TABLE "tour_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tour_id" integer NOT NULL,
	"url" varchar(255) NOT NULL,
	"description" text,
	"is_main" boolean DEFAULT false,
	CONSTRAINT "tour_photos_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "tours" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"country" varchar(100) NOT NULL,
	"city" varchar(100),
	"type" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'UAH',
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"available_spots" integer NOT NULL,
	"conditions" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
