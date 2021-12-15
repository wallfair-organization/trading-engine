import {
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
  NetworkCode,
} from '.';

export interface ExternalTransactionLog {
  originator: ExternalTransactionOriginator;
  external_system: string;
  status: ExternalTransactionStatus;
  external_transaction_id: string;
  transaction_hash?: string;
  network_code: NetworkCode;
  symbol?: string;
  sender?: string;
  receiver?: string;
  amount?: string;
  fee?: string;
  input_currency?: string;
  input_amount?: string;
  internal_user_id?: string;
}
