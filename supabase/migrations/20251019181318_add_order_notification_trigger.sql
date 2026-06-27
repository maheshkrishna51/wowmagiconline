/*
  # Add Order Notification System

  1. Changes
    - Create a function to handle new order notifications
    - Create a trigger on orders table to call Edge Function
    - Uses pg_net extension to make HTTP requests to Edge Function

  2. Security
    - Function runs with security definer to access pg_net
*/

CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  function_url text;
BEGIN
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify-new-order';
  
  PERFORM net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'order_id', NEW.id,
      'order_number', NEW.order_number,
      'customer_name', NEW.customer_name,
      'customer_whatsapp', NEW.customer_whatsapp,
      'delivery_address', NEW.delivery_address,
      'total_amount', NEW.total_amount,
      'items', NEW.items
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_created ON orders;

CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();
