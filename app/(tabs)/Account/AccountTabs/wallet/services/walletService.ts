import { supabase } from '@/lib/supabase';
import { WalletData, STKPushPayload, STKPushResponse, Transaction } from '../types/wallet.types';

export const walletService = {
  async getWalletData(userId: string): Promise<WalletData | null> {
    try {
      // 1. Fetch user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', userId)
        .single();

      const userPhone = profileData?.phone || '';

      // 2. Fetch wallet metadata and active balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('id, balance, currency')
        .eq('user_id', userId)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Wallet doesn't exist, create one
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: userId,
              balance: 0,
              currency: 'KES'
            }
          ])
          .select('id, balance, currency')
          .single();

        if (createError) throw createError;
        
        if (newWallet) {
          return {
            balance: Number(newWallet.balance),
            currency: newWallet.currency || 'KES',
            transactions: [],
            userPhone
          };
        }
      } else if (walletData) {
        // 3. Fetch transactions
        const { data: txData } = await supabase
          .from('wallet_transactions')
          .select('id, amount, type, status, reference, description, created_at')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false })
          .limit(15);

        return {
          balance: Number(walletData.balance),
          currency: walletData.currency || 'KES',
          transactions: (txData || []) as Transaction[],
          userPhone
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      throw error;
    }
  },

  async initiateSTKPush(payload: STKPushPayload): Promise<STKPushResponse> {
    const { userId, amount, phone, backendUrl } = payload;

    // Validate phone number
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Format phone number
    const formattedPhone = this.formatPhoneForBackend(phone);

    const requestPayload = {
      userId,
      amount,
      phone: formattedPhone,
    };

    console.log('Sending STK Push request:', {
      url: `${backendUrl}/api/stk-push`,
      payload: requestPayload
    });

    try {
      const response = await fetch(`${backendUrl}/api/stk-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const responseText = await response.text();
      console.log('STK Push response:', {
        status: response.status,
        body: responseText
      });

      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.error || errorJson.details || errorMessage;
        } catch (parseErr) {
          errorMessage = `${errorMessage}: ${responseText.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      }

      const jsonResult = JSON.parse(responseText);
      return jsonResult;
    } catch (error) {
      console.error('STK Push error:', error);
      throw error;
    }
  },

  formatPhoneForBackend(phone: string): string {
    // Remove all spaces and special characters
    let cleaned = phone.replace(/\s/g, '').replace(/[^0-9+]/g, '');
    
    // Remove leading + if present
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // Format for Kenya
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('254')) {
      // Already formatted
      return cleaned;
    }
    
    return cleaned;
  }
};