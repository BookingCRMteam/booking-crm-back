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
	CONSTRAINT "operators_email_unique" UNIQUE("email"),
	CONSTRAINT "operators_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
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
ALTER TABLE "operators" ADD CONSTRAINT "operators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE no action ON UPDATE no action;
+--> statement-breakpoint
+ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk"
+  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
+--> statement-breakpoint
+CREATE INDEX IF NOT EXISTS "bookings_user_id_idx" ON "bookings" ("user_id");
+CREATE INDEX IF NOT EXISTS "bookings_tour_id_idx" ON "bookings" ("tour_id");
