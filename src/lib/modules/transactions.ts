import { getRepository } from 'typeorm';
import { ExternalTransaction } from '../../db/entities/ExternalTransaction';
import { Transaction } from '../../db/entities/Transaction';
import { ExternalTransactionStatus } from '../../db/enums/ExternalTransactionStatus';
import { ExternalTransaction as ExternalTransactionModel } from '../models';
import { Transaction as TransactionModel } from '../models/transaction';

export class Transactions {
  async insertTransaction(transaction: TransactionModel) {
    try {
      const transactionRepo = getRepository(Transaction);
      const transactionEntity = new Transaction();
      transactionEntity.assignAttributes({ ...transaction });
      await transactionRepo.save(transactionEntity);
    } catch (e) {
      console.error('ERROR: ', e.message);
      throw new ModuleException(e.message);
    }
  }

  async insertExternalTransaction(externalTransaction: ExternalTransactionModel) {
    try {
      const transactionRepo = getRepository(ExternalTransaction);
      const entity = new ExternalTransaction();
      entity.assignAttributes({ ...externalTransaction });
      await transactionRepo.save(entity);
    } catch (e) {
      console.error('ERROR: ', e.message);
      throw new ModuleException(e.message);
    }
  }

  async getExternalTransaction(id: string) {
    try {
      const transactionRepo = getRepository(ExternalTransaction);
      return await transactionRepo.findOne({ where: { external_transaction_id: id } });
    } catch (e) {
      console.error('ERROR: ', e.message);
      throw new ModuleException(e.message);
    }
  }

  async updateExternalTransactionStatus(id: string, status: ExternalTransactionStatus) {
    try {
      const transactionRepo = getRepository(ExternalTransaction);
      const entity = await transactionRepo.findOneOrFail({ where: {
        external_transaction_id: id
      }});

      await transactionRepo.save({
        ...entity,
        status,
      });
    } catch (e) {
      console.error('ERROR: ', e.message);
      throw new ModuleException(e.message);
    }
  }
}