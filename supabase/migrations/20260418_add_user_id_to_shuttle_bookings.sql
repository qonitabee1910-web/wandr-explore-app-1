-- Add user_id to shuttle_bookings for user association
ALTER TABLE shuttle_bookings 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_user ON shuttle_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_shuttle_bookings_user_created ON shuttle_bookings(user_id, created_at DESC);

-- Add user email column for display if user deleted
ALTER TABLE shuttle_bookings 
ADD COLUMN IF NOT EXISTS user_email text;
