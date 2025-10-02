CREATE UNIQUE INDEX IF NOT EXISTS booking_user_tour_pending_idx ON "bookings" ("user_id", "tour_id") WHERE "status" = 'pending_payment';
