import { EntityManager, In } from 'typeorm';
import { ExternalTransaction } from '../../db/entities/ExternalTransaction';
import { Transaction } from '../../db/entities/Transaction';
import {
  ExternalTransaction as ExternalTransactionModel,
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
  NetworkCode,
  TransactionOrder,
} from '../models';
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
      return await this.entityManager.insert(Transaction, transaction);
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }

  async insertExternalTransaction(
    externalTransaction: ExternalTransactionModel
  ) {
    try {
      return await this.entityManager.insert(
        ExternalTransaction,
        externalTransaction
      );
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
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
    }
  }

  async updateTransactionQueueState(
    id: string,
    status: ExternalTransactionStatus,
    hash: string
  ) {
    try {
      return await this.entityManager.update(
        ExternalTransaction,
        {
          id: id,
        },
        {
          status: status,
          transaction_hash: hash,
          external_transaction_id: hash,
        }
      );
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }

  async getTransactionQueue(id: string) {
    return await this.entityManager.findOne(ExternalTransaction, {
      where: { id: id },
      relations: ['transaction_queue'],
    });
  }

  async getTransactionQueueByStatuses(
    statuses: ExternalTransactionStatus[],
    network_code: NetworkCode,
    originator: ExternalTransactionOriginator,
    limit = 10,
    order: TransactionOrder = TransactionOrder.ASC
  ) {
    return await this.entityManager.find(ExternalTransaction, {
      where: {
        status: In(statuses),
        originator,
        network_code,
      },
      relations: ['transaction_queue'],
      take: limit,
      order: {
        created_at: order,
      },
    });
  }

  async getExternalTransaction(external_transaction_id: string) {
    return await this.entityManager.findOne(ExternalTransaction, {
      where: { external_transaction_id },
    });
  }

  async updateExternalTransaction(
    external_transaction_id: string,
    externalTransaction: Partial<ExternalTransactionModel>
  ) {
    try {
      return await this.entityManager.update(
        ExternalTransaction,
        {
          external_transaction_id,
        },
        externalTransaction
      );
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }

  async insertExternalTransactionLog(
    externalTransactionLog: ExternalTransactionLogModel
  ) {
    try {
      return await this.entityManager.insert(
        ExternalTransactionLog,
        externalTransactionLog
      );
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }
}
