import { Wallet } from './wallet';
import { Transactions } from './transactions';
import { TransactionManager } from './transaction-manager';
import { EntityManager, getConnection } from 'typeorm';

const getEntityManager = (): EntityManager => {
  try {
    const connection = getConnection();
    return new EntityManager(connection, connection.createQueryRunner());
  } catch (e) {
    console.error(e.message);
    return undefined;
  }
};

export { TransactionManager, Wallet, Transactions, getEntityManager };
