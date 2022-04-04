import {
  Between,
  EntityManager,
  FindConditions,
  In,
  IsNull,
  Not,
} from 'typeorm';
import { ExternalTransaction } from '../../db/entities/ExternalTransaction';
import {
  ExternalTransaction as ExternalTransactionModel,
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
  NetworkCode,
  TransactionOrder,
} from '../models';
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

  async insertExternalTransaction(
    externalTransaction: ExternalTransactionModel
  ) {
    try {
      return await this.entityManager
        .createQueryBuilder()
        .insert()
        .into(ExternalTransaction)
        .values(externalTransaction)
        .updateEntity(false)
        .returning('*')
        .execute();
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
    order: TransactionOrder = TransactionOrder.ASC,
    skip = 0
  ) {
    return await this.entityManager.find(ExternalTransaction, {
      where: {
        status: In(statuses),
        originator,
        network_code,
      },
      relations: ['transaction_queue'],
      take: limit,
      skip: skip,
      order: {
        created_at: order,
      },
    });
  }

  async getExternalTransactionForUpdate(external_transaction_id: string) {
    return await this.entityManager
      .createQueryBuilder(ExternalTransaction, 'external_transaction')
      .useTransaction(!this.entityManager.queryRunner?.isTransactionActive)
      .setLock('pessimistic_write')
      .where('external_transaction_id = :external_transaction_id', {
        external_transaction_id,
      })
      .getOne();
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
      return await this.entityManager
        .createQueryBuilder()
        .insert()
        .into(ExternalTransactionLog)
        .values(externalTransactionLog)
        .updateEntity(false)
        .returning('*')
        .execute();
    } catch (e) {
      console.error('ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }

  async getExternalTransactionLogs(
    externalTransactionLogConditions: FindConditions<ExternalTransactionLogModel>
  ) {
    return await this.entityManager.find(
      ExternalTransactionLog,
      externalTransactionLogConditions
    );
  }

  async getExternalTransactionLogsByTimeState(
    externalTransactionLogConditions: FindConditions<ExternalTransactionLogModel>,
    dates: Date[]
  ) {
    return await this.entityManager.find(ExternalTransactionLog, {
      where: {
        ...externalTransactionLogConditions,
        created_at: Between(
          new Date(dates[0]).toISOString(),
          new Date(dates[1]).toISOString()
        ),
      },
    });
  }

  async getLastExternalByBlockNumber(
    originator: ExternalTransactionOriginator,
    status: ExternalTransactionStatus,
    network_code: NetworkCode
  ) {
    return await this.entityManager.findOne(ExternalTransaction, {
      where: {
        originator,
        status,
        network_code,
        block_number: Not(IsNull()),
      },
      relations: ['transaction_queue'],
      order: {
        block_number: TransactionOrder.DESC,
      },
    });
  }

  async searchExternalTransaction(search: Partial<ExternalTransactionModel>) {
    return await this.entityManager.find(ExternalTransaction, search);
  }

  async getExternalTransactionByHash(txHash: string) {
    return await this.entityManager.findOne(ExternalTransaction, {
      where: {
        transaction_hash: txHash,
      },
    });
  }

  async getExternalTransactionLogByHash(txHash: string) {
    return await this.entityManager.findOne(ExternalTransactionLog, {
      where: {
        transaction_hash: txHash,
      },
      order: {
        created_at: TransactionOrder.DESC,
      },
    });
  }

  async getSumAmountByOriginator(
    originator: ExternalTransactionOriginator,
    userId: string
  ) {
    const result = await this.entityManager
      .createQueryBuilder()
      .select('SUM(amount)')
      .from(ExternalTransactionLog, 'log')
      .where({
        originator,
        internal_user_id: userId,
      })
      .getRawOne();
    return result.sum || 0;
  }
}
