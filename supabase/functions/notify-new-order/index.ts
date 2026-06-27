import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderItem {
  product_name: string;
  variant_name?: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderData {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_whatsapp: string;
  delivery_address: string;
  total_amount: number;
  items: OrderItem[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const orderData: OrderData = await req.json();

    const itemsList = orderData.items
      .map(
        (item) =>
          `- ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ""} x ${item.quantity} = ₹${item.total.toFixed(2)}`
      )
      .join("\n");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .order-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .items-list { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .item:last-child { border-bottom: none; }
          .total { font-size: 1.25rem; font-weight: bold; color: #f43f5e; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.875rem; }
          h1 { margin: 0; font-size: 1.5rem; }
          h2 { color: #1f2937; margin-top: 0; }
          .label { font-weight: 600; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Order Received!</h1>
            <p style="margin: 10px 0 0;">Order #${orderData.order_number}</p>
          </div>
          <div class="content">
            <div class="order-details">
              <h2>Customer Information</h2>
              <p><span class="label">Name:</span> ${orderData.customer_name}</p>
              <p><span class="label">WhatsApp:</span> ${orderData.customer_whatsapp}</p>
              <p><span class="label">Delivery Address:</span><br>${orderData.delivery_address}</p>
            </div>
            
            <div class="items-list">
              <h2>Order Items</h2>
              ${orderData.items.map(item => `
                <div class="item">
                  <strong>${item.product_name}</strong>
                  ${item.variant_name ? `<span style="color: #6b7280;">(${item.variant_name})</span>` : ""}
                  <br>
                  <span style="color: #6b7280;">Quantity: ${item.quantity} × ₹${item.price.toFixed(2)} = ₹${item.total.toFixed(2)}</span>
                </div>
              `).join("")}
              <div class="total">Total Amount: ₹${orderData.total_amount.toFixed(2)}</div>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification from your e-commerce system.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Order Received!

Order Number: ${orderData.order_number}

Customer Information:
- Name: ${orderData.customer_name}
- WhatsApp: ${orderData.customer_whatsapp}
- Delivery Address: ${orderData.delivery_address}

Order Items:
${itemsList}

Total Amount: ₹${orderData.total_amount.toFixed(2)}
    `;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      
      console.log("Order notification (email not sent - API key missing):");
      console.log(emailText);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Order logged (email not configured)",
          order_number: orderData.order_number 
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Orders <onboarding@resend.dev>",
        to: ["hellowowmagic@gmail.com"],
        subject: `New Order #${orderData.order_number} - ${orderData.customer_name}`,
        html: emailHtml,
        text: emailText,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Failed to send email:", emailResult);
      throw new Error(`Email sending failed: ${JSON.stringify(emailResult)}`);
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Order notification sent",
        email_id: emailResult.id,
        order_number: orderData.order_number 
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in notify-new-order function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
