import {
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
  NetworkCode,
} from '.';

export interface ExternalTransaction {
  originator: ExternalTransactionOriginator;
  external_system: string;
  status: ExternalTransactionStatus;
  external_transaction_id: string;
  transaction_hash?: string;
  network_code: NetworkCode;
}
