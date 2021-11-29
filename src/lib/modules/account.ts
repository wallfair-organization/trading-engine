import { User } from '../../db/entities/User';
import { Account as AccountEntity } from '../../db/entities/Account';
import { EntityManager, InsertResult } from 'typeorm';
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
    const account = await this.findAccount(ethAccount);
    const params = {
      owner_account: ethAccount,
      account_namespace: AccountNamespace.ETH,
      symbol: 'WFAIR',
      users: [
        {
          user_id: userId,
        },
      ],
    };

    if (!account) {
      params['balance'] = '0';
    }

    const result = await this.entityManager.save(AccountEntity, params);
    return { ...account, ...result };
  }

  async createUser(userId: string) {
    try {
      const account = {
        owner_account: userId,
        account_namespace: AccountNamespace.USR,
        symbol: 'WFAIR',
      };

      let userCreated: InsertResult, accountCreated: InsertResult;

      await this.runInTransaction(async (em: EntityManager) => {
        userCreated = await em.insert(User, { user_id: userId });
        accountCreated = await em.insert(AccountEntity, {
          ...account,
          balance: '0',
        });
        await em
          .createQueryBuilder()
          .relation(User, 'accounts')
          .of(userId)
          .add(account);
      });

      return {
        ...{ ...userCreated.raw[0], ...userCreated.identifiers[0] },
        ...{ ...accountCreated.raw[0], ...accountCreated.identifiers[0] },
      };
    } catch (e) {
      console.error('USER CREATION: ', e.message);
      this.rollbackTransaction();
      throw new ModuleException('User creation failed');
    }
  }
}
