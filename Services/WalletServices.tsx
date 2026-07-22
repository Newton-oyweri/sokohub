// services/walletService.ts
import { supabase } from '@/lib/supabase';

export interface ServiceItem {
  id: string;
  seller_id?: string;
  name: string;
  price: number;
  description?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Fetch available booking services from Supabase
 */
export async function fetchBookingServices(): Promise<ServiceItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, seller_id, name, price, description')
    .eq('post_type', 'booking')
    .eq('is_available', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as ServiceItem[]) || [];
}

/**
 * Request a call back for a specific service
 */
export async function submitCallbackRequest(
  item: ServiceItem,
  sellerId: string | null,
  userId: string,
  userPhone: string,
  notes: string
): Promise<ActionResult> {
  try {
    const { error } = await supabase.from('service_requests').insert([
      {
        user_id: userId,
        seller_id: item.seller_id || sellerId || null,
        service_id: item.id,
        service_name: item.name,
        amount: item.price,
        request_type: 'callback',
        status: 'pending',
        user_phone: userPhone || null,
        notes: notes || null,
      },
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Callback request failed.' };
  }
}

/**
 * Submit a custom task quote request
 */
export async function submitCustomTaskRequest(
  taskText: string,
  defaultSellerId?: string
): Promise<ActionResult> {
  try {
    const { error } = await supabase.from('products').insert([
      {
        seller_id: defaultSellerId || 'fc880aa8-accf-43ad-bb05-9d025d9d74c7',
        name: taskText,
        description: 'Custom requested task',
        price: 150.0,
        category: 'events',
        rating: 5.0,
        is_available: true,
        post_type: 'booking',
      },
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit custom task.' };
  }
}

