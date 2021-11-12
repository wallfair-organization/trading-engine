import { TransactionQueue } from './TransactionQueue';
import { Entity, OneToOne } from 'typeorm';
import { ExternalTransactionBase } from './ExternalTransactionBase';

@Entity()
export class ExternalTransaction extends ExternalTransactionBase {
  @OneToOne(
    () => TransactionQueue,
    (transactionQueue) => transactionQueue.external_transaction
  )
  transaction_queue: TransactionQueue;
}
