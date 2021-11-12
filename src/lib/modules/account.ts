import { UserAccount } from '../../db/entities/UserAccount';
import { EntityManager } from 'typeorm';
import { BaseModule } from './base-module';
import { ModuleException } from './exceptions/module-exception';
import { AccountNamespace } from '../models/enums/AccountNamespace';

export class Account extends BaseModule {
  constructor(entityManager?: EntityManager) {
    super(entityManager);
  }

  async isUserOwner(userId: string, account: string) {
    try {
      const userAccount = await this.entityManager.findOneOrFail(UserAccount, {
        where: {
          user_id: userId,
          account: {
            owner_account: account,
            account_namespace: AccountNamespace.ETH,
          },
        },
        relations: ['account'],
      });
      return userAccount;
    } catch (e) {
      console.error('IS USER OWNER CHECK ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Ethereum address not mapped to the user');
    } finally {
      if (!this.entityManager.queryRunner.isTransactionActive) {
        this.entityManager.release();
      }
    }
  }
}
