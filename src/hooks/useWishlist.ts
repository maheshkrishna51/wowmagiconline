import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function getSessionId(): string {
  let sessionId = localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionId = getSessionId();

  const loadWishlist = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('session_id', sessionId);

    if (!error && data) {
      setWishlist(data.map((item) => item.product_id));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const addToWishlist = async (productId: string) => {
    const { error } = await supabase
      .from('wishlists')
      .insert({ session_id: sessionId, product_id: productId });

    if (!error) {
      setWishlist((current) => [...current, productId]);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('session_id', sessionId)
      .eq('product_id', productId);

    if (!error) {
      setWishlist((current) => current.filter((id) => id !== productId));
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return { wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading };
}
