import { ExternalTransactionOriginator, ExternalTransactionStatus } from ".";

export interface ExternalTransaction {
  originator: ExternalTransactionOriginator;
  external_system: string;
  status: ExternalTransactionStatus;
  external_transaction_id: string;
}
