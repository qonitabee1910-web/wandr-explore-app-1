-- Add driver_pos column to vehicles table for storing driver position
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS driver_pos jsonb DEFAULT '{"x": 50, "y": 8}';

-- Add comment to explain the column
COMMENT ON COLUMN vehicles.driver_pos IS 'Driver position in percentage coordinates {x: 0-100, y: 0-100}';
