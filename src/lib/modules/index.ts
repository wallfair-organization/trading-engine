import { Account } from './account';
import { Wallet } from './wallet';
import { Transactions } from './transactions';
import { TransactionManager } from './transaction-manager';
import { Query } from './query';
import { EntityManager, getConnection } from 'typeorm';

const getEntityManager = (transactional: boolean): EntityManager => {
  try {
    const connection = getConnection();
    return new EntityManager(
      connection,
      transactional ? connection.createQueryRunner() : null
    );
  } catch (e) {
    console.error(e.message);
    return undefined;
  }
};

export {
  Account,
  TransactionManager,
  Wallet,
  Transactions,
  Query,
  getEntityManager,
};
