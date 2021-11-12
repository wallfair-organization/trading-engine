import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';

export * from './lib/main';
export { Beneficiary, ExternalTransaction, Transaction } from './lib/models';
export { Wallet, Transactions, TransactionManager } from './lib/modules';
