export interface TransactionQueue {
  amount: string;
  network_code: string;
  receiver: string;
  sender?: string;
  symbol: string;
  namespace: string;
}
