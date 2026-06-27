/*
  # Add Cost Price to Products

  1. Changes
    - Add `cost_price` column to `products` table
      - Type: decimal(10,2)
      - Not null with default value 0
      - Used to track the cost price for inventory valuation
    
  2. Notes
    - Existing products will have cost_price set to 0 by default
    - This enables tracking of both cost value (inventory) and sales value (potential revenue)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE products ADD COLUMN cost_price decimal(10,2) NOT NULL DEFAULT 0;
  END IF;
END $$;
