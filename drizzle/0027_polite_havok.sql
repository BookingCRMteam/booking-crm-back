CREATE TYPE "public"."operator_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "operators" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."operator_status";--> statement-breakpoint
ALTER TABLE "operators" ALTER COLUMN "status" SET DATA TYPE "public"."operator_status" USING "status"::"public"."operator_status";