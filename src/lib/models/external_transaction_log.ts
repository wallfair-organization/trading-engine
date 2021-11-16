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
}