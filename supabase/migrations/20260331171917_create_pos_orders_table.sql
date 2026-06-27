/*
  # Create POS Orders Table

  1. New Tables
    - `pos_orders`
      - `id` (uuid, primary key) - Unique order identifier
      - `order_number` (text, unique) - Human-readable order number
      - `customer_id` (uuid, nullable) - Optional link to customers
      - `customer_name` (text) - Customer name or "Walk-in Customer"
      - `items` (jsonb) - Array of ordered items with details
      - `subtotal` (decimal) - Items total
      - `tax` (decimal) - Tax amount
      - `discount` (decimal) - Discount amount
      - `total_amount` (decimal) - Final total
      - `payment_method` (text) - Payment method (cash/card)
      - `amount_paid` (decimal) - Amount paid by customer
      - `change_amount` (decimal) - Change returned to customer
      - `status` (text) - Order status
      - `notes` (text) - Order notes
      - `created_by` (uuid) - Admin user who created the order
      - `created_at` (timestamptz) - Order timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `pos_orders` table
    - Only authenticated users can create and view POS orders
    - Only authenticated users can update POS orders

  3. Notes
    - POS orders are separate from online orders
    - Customer details are optional for walk-in sales
    - Includes payment tracking with cash handling
*/

-- Create pos_orders table
CREATE TABLE IF NOT EXISTS pos_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT 'POS-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0'),
  customer_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  customer_name text DEFAULT 'Walk-in Customer',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'cash',
  amount_paid numeric(10,2) DEFAULT 0,
  change_amount numeric(10,2) DEFAULT 0,
  status text DEFAULT 'completed',
  notes text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pos_orders_order_number ON pos_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_pos_orders_created_at ON pos_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_orders_customer ON pos_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_pos_orders_status ON pos_orders(status);

-- Enable RLS
ALTER TABLE pos_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view POS orders"
  ON pos_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create POS orders"
  ON pos_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update POS orders"
  ON pos_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete POS orders"
  ON pos_orders FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pos_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pos_orders_updated_at
  BEFORE UPDATE ON pos_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_pos_orders_updated_at();
