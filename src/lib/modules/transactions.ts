import { EntityManager } from 'typeorm';
import { ExternalTransaction } from '../../db/entities/ExternalTransaction';
import { Transaction } from '../../db/entities/Transaction';
import { ExternalTransaction as ExternalTransactionModel } from '../models';
import { Transaction as TransactionModel } from '../models/transaction';
import { TransactionQueue as TransactionQueueModel } from '../models/transaction_queue';
import { ExternalTransactionLog as ExternalTransactionLogModel } from '../models/external_transaction_log';
import { BaseModule } from './base-module';
import { ModuleException } from './exceptions/module-exception';
import { TransactionQueue } from '../../db/entities/TransactionQueue';
import { ExternalTransactionLog } from '../../db/entities/ExternalTransactionLog';

export class Transactions extends BaseModule {
  constructor(entityManager?: EntityManager) {
    super(entityManager);
  }

  async insertTransaction(transaction: TransactionModel) {
    try {
      await this.entityManager.insert(Transaction, transaction);
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    } finally {
      this.releaseConnection();
    }
  }

  async insertExternalTransaction(
    externalTransaction: ExternalTransactionModel
  ) {
    try {
      await this.entityManager.insert(ExternalTransaction, externalTransaction);
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    } finally {
      this.releaseConnection();
    }
  }

  async insertTransactionQueue(
    externalTransaction: ExternalTransactionModel,
    transactionQueue: TransactionQueueModel
  ) {
    try {
      const txQueue = new TransactionQueue();
      txQueue.assignAttributes(transactionQueue);

      const externalTx = new ExternalTransaction();
      externalTx.assignAttributes(externalTransaction);
      externalTx.transaction_queue = txQueue;

      return await this.entityManager.save(externalTx);
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    } finally {
      this.releaseConnection();
    }
  }

  async getTransactionQueue(id: string) {
    try {
      return await this.entityManager.findOne(ExternalTransaction, {
        where: { id: id },
        relations: ['transaction_queue'],
      });
    } finally {
      this.releaseConnection();
    }
  }

  async getExternalTransaction(id: string) {
    try {
      return await this.entityManager.findOne(ExternalTransaction, {
        where: { external_transaction_id: id },
      });
    } finally {
      this.releaseConnection();
    }
  }

  async updateExternalTransaction(
    id: string,
    externalTransaction: ExternalTransactionModel
  ) {
    try {
      await this.entityManager.update(
        ExternalTransaction,
        {
          external_transaction_id: id,
        },
        externalTransaction
      );
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    } finally {
      this.releaseConnection();
    }
  }

  async insertExternalTransactionLog(
    externalTransactionLog: ExternalTransactionLogModel
  ) {
    try {
      await this.entityManager.insert(
        ExternalTransactionLog,
        externalTransactionLog
      );
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    } finally {
      this.releaseConnection();
    }
  }
}
