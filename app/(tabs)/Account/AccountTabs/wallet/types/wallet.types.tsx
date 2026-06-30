export interface Transaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'PURCHASE';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  reference: string | null;
  description: string | null;
  created_at: string;
}

export interface WalletScreenProps {
  onBack: () => void;
}

export interface WalletData {
  balance: number;
  currency: string;
  transactions: Transaction[];
  userPhone: string;
}

export interface STKPushPayload {
  userId: string;
  amount: number;
  phone: string;
  backendUrl: string;
}

export interface STKPushResponse {
  success: boolean;
  message?: string;
  data?: any;
}