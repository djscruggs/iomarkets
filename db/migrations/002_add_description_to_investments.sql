-- Migration: Add description column to investments table
-- Date: 2025-10-20

-- Add description column as TEXT (large text field)
ALTER TABLE investments ADD COLUMN description TEXT;
