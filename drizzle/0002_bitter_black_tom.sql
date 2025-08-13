CREATE TABLE "operators" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer NOT NULL,
	"company_name" text NOT NULL,
	"description" text NOT NULL,
	"contact_person" text NOT NULL,
	"website" text NOT NULL,
	"phone" text NOT NULL,
	CONSTRAINT "operators_email_unique" UNIQUE("email")
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
--> statement-breakpoint
ALTER TABLE "operators" ADD CONSTRAINT "operators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;