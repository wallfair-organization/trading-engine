import { EntityManager } from 'typeorm';
import { Account, getEntityManager } from '.';
import { Transactions } from './transactions';
import { Wallet } from './wallet';

export class TransactionManager {
  wallet: Wallet;
  transactions: Transactions;
  account: Account;
  entityManager: EntityManager;

  constructor() {
    const em = getEntityManager(true);
    this.entityManager = em;
    this.wallet = new Wallet(em);
    this.transactions = new Transactions(em);
    this.account = new Account(em);
  }

  async startTransaction() {
    if (!this.entityManager.queryRunner.isTransactionActive) {
      await this.entityManager.queryRunner.startTransaction();
    }
  }

  async commitTransaction() {
    if (this.entityManager.queryRunner.isTransactionActive) {
      await this.entityManager.queryRunner.commitTransaction();
      await this.entityManager.release();
    }
  }

  async rollbackTransaction() {
    if (this.entityManager.queryRunner.isTransactionActive) {
      await this.entityManager.queryRunner.rollbackTransaction();
      await this.entityManager.release();
    }
  }
}
