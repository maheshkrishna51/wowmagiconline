/*
  # Make Customer Fields Optional for Walk-in Orders

  1. Changes
    - Modify `customer_name` to allow NULL values (for walk-in customers)
    - Modify `customer_whatsapp` to allow NULL values (for walk-in customers)
    - Set default values for these fields when NULL
  
  2. Notes
    - This enables POS orders without customer details
    - Walk-in customers will be recorded as "Walk-in Customer"
    - Maintains data integrity while adding flexibility
*/

-- Make customer fields nullable
ALTER TABLE orders 
ALTER COLUMN customer_name DROP NOT NULL,
ALTER COLUMN customer_whatsapp DROP NOT NULL;

-- Set default values for walk-in customers
ALTER TABLE orders 
ALTER COLUMN customer_name SET DEFAULT 'Walk-in Customer',
ALTER COLUMN customer_whatsapp SET DEFAULT 'N/A';
