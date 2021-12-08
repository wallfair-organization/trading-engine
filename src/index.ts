import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';

import { BigNumber } from 'bignumber.js';
BigNumber.set({ DECIMAL_PLACES: 18 });

export { BigNumber as BN };
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
  Query,
} from './lib/modules';
