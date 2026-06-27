/*
  # Fix Order Notification Trigger

  1. Changes
    - Drop the previous trigger function
    - Create a simpler notification system using Supabase's HTTP extension
    - The function will invoke the Edge Function when a new order is created

  2. Notes
    - Uses supabase_functions.http_request to call the Edge Function
    - Runs asynchronously to not block order creation
*/

DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS notify_new_order();

CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  request_id bigint;
  function_url text;
BEGIN
  function_url := current_setting('app.supabase_url', true) || '/functions/v1/notify-new-order';
  
  SELECT INTO request_id net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := jsonb_build_object(
      'order_id', NEW.id::text,
      'order_number', NEW.order_number,
      'customer_name', NEW.customer_name,
      'customer_whatsapp', NEW.customer_whatsapp,
      'delivery_address', NEW.delivery_address,
      'total_amount', NEW.total_amount,
      'items', NEW.items
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send order notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();
