import { supabase } from '@/lib/supabase';

export interface ServiceItem {
  id: string;
  seller_id?: string;
  name: string;
  price: number;
  description?: string;
  image_urls?: string[] | null;
}

/**
 * Fetches all available products under the 'services' category, regardless of post_type.
 */
export async function fetchAllAvailableServices(): Promise<ServiceItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, seller_id, name, price, description, image_urls')
    .eq('product_category_id', 'services')
    .eq('is_available', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as ServiceItem[]) || [];
}

/**
 * Fetches logged-in user phone number.
 */
export async function fetchUserProfilePhone(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data.phone || null;
}

/**
 * Submits a callback request.
 */
export async function createCallbackRequest(params: {
  userId: string;
  sellerId?: string | null;
  serviceId: string;
  serviceName: string;
  amount: number;
  userPhone: string;
  notes: string;
}) {
  const { error } = await supabase.from('service_requests').insert([
    {
      user_id: params.userId,
      seller_id: params.sellerId || null,
      service_id: params.serviceId,
      service_name: params.serviceName,
      amount: params.amount,
      request_type: 'callback',
      status: 'pending',
      user_phone: params.userPhone,
      notes: params.notes,
    },
  ]);

  if (error) throw error;
}

/**
 * Submits a custom task request.
 */
export async function createCustomTaskRequest(params: {
  userId: string;
  sellerId?: string | null;
  taskText: string;
  userPhone: string;
}) {
  const { error } = await supabase.from('service_requests').insert([
    {
      user_id: params.userId,
      seller_id: params.sellerId || null,
      service_id: null,
      service_name: params.taskText,
      amount: null,
      request_type: 'custom_task',
      status: 'pending',
      user_phone: params.userPhone,
      notes: params.taskText,
    },
  ]);

  if (error) throw error;
}

