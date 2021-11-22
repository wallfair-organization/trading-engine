import { User } from '../../db/entities/User';
import { Account as AccountEntity } from '../../db/entities/Account';
import { EntityManager } from 'typeorm';
import { BaseModule } from './base-module';
import { ModuleException } from './exceptions/module-exception';
import { AccountNamespace } from '../models/enums/AccountNamespace';
import { Beneficiary } from '../models';

export class Account extends BaseModule {
  constructor(entityManager?: EntityManager) {
    super(entityManager);
  }

  async isUserOwner(userId: string, account: string) {
    try {
      return await this.entityManager
        .createQueryBuilder(User, 'user')
        .innerJoinAndSelect('user.accounts', 'account')
        .where(
          'user_account.owner_account = :account AND user_account.user_id = :userId',
          {
            account,
            userId,
          }
        )
        .getOneOrFail();
    } catch (e) {
      console.error('IS USER OWNER CHECK ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Ethereum address not mapped to the user');
    }
  }

  async findAccount(ethAccount: string) {
    return await this.entityManager.findOne(AccountEntity, {
      where: {
        owner_account: ethAccount,
        account_namespace: AccountNamespace.ETH,
        symbol: 'WFAIR',
      },
      relations: ['users'],
    });
  }

  async createAccount(account: Beneficiary, balance: string) {
    try {
      return await this.entityManager.insert(AccountEntity, {
        owner_account: account.owner,
        account_namespace: account.namespace,
        symbol: account.symbol,
        balance,
      });
    } catch (e) {
      console.error('CREATE ACCOUNT: ', e.message);
      throw new ModuleException('Create account failed');
    }
  }

  async linkEthereumAccount(userId: string, ethAccount: string) {
    try {
      const qb = this.entityManager.createQueryBuilder();

      await qb
        .insert()
        .into(User)
        .values({
          user_id: userId,
        })
        .orIgnore()
        .execute();

      await qb.relation(User, 'accounts').of(userId).add({
        owner_account: ethAccount,
        account_namespace: AccountNamespace.ETH,
        symbol: 'WFAIR',
      });
    } catch (e) {
      console.error('LINK ACCOUNT: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Failed to link account');
    }
  }
}
