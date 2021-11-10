export interface Transaction {
  sender_namespace: string;
  sender_account: string;
  receiver_namespace: string;
  receiver_account: string;
  symbol: string;
  amount: number;
}