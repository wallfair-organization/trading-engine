import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';

export * from './lib/main';
export {
  Beneficiary,
  ExternalTransaction,
  Transaction,
  AccountNamespace,
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
} from './lib/models';
export {
  Account,
  Wallet,
  Transactions,
  TransactionManager,
} from './lib/modules';
