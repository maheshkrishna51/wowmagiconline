import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          image_url: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string;
          short_description: string;
          price: number;
          compare_price: number;
          sku: string;
          stock_quantity: number;
          low_stock_threshold: number;
          images: string[];
          custom_options: Record<string, unknown>;
          is_featured: boolean;
          is_active: boolean;
          seo_title: string;
          seo_description: string;
          seo_keywords: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          customer_whatsapp: string;
          delivery_address: string;
          items: Array<{
            product_id: string;
            name: string;
            price: number;
            quantity: number;
            image: string;
          }>;
          subtotal: number;
          delivery_fee: number;
          total_amount: number;
          status: string;
          notes: string;
          admin_notes: string;
          whatsapp_sent: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          customer_name: string;
          rating: number;
          comment: string;
          image_url: string;
          is_featured: boolean;
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
      };
      portfolio_items: {
        Row: {
          id: string;
          title: string;
          description: string;
          images: string[];
          category: string;
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
      };
      cms_content: {
        Row: {
          id: string;
          key: string;
          title: string;
          content: string;
          metadata: Record<string, unknown>;
          updated_at: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          category: string;
          updated_at: string;
        };
      };
    };
  };
};
