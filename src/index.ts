import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { initDb } from "./lib/main";

export * from './lib/main';
export {
  Beneficiary,
  ExternalTransaction,
  ExternalTransactionLog,
  Transaction,
  AccountNamespace,
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
  NetworkCode,
  TransactionOrder,
} from './lib/models';
export {
  Account,
  Wallet,
  Transactions,
  TransactionManager,
} from './lib/modules';
(async () => await initDb())();
