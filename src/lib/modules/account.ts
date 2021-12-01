import { Account as AccountEntity } from '../../db/entities/Account';
import { EntityManager, InsertResult } from 'typeorm';
import { BaseModule } from './base-module';
import { ModuleException } from './exceptions/module-exception';
import { AccountNamespace } from '../models/enums/AccountNamespace';
import { Beneficiary } from '../models';
import { UserAccount } from '../../db/entities/UserAccount';

export class Account extends BaseModule {
  constructor(entityManager?: EntityManager) {
    super(entityManager);
  }

  async isUserOwner(userId: string, account: string) {
    try {
      return await this.entityManager.findOneOrFail(UserAccount, {
        where: {
          user_id: userId,
          owner_account: account,
        },
      });
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
    let accountInsert: InsertResult, userAccountInsert: InsertResult;

    await this.runInTransaction(async (em: EntityManager) => {
      accountInsert = await em
        .createQueryBuilder()
        .insert()
        .into(AccountEntity)
        .values({
          owner_account: ethAccount,
          account_namespace: AccountNamespace.ETH,
          symbol: 'WFAIR',
          balance: '0',
        })
        .orIgnore()
        .execute();

      userAccountInsert = await em
        .createQueryBuilder()
        .insert()
        .into(UserAccount)
        .values({
          user_id: userId,
          owner_account: ethAccount,
          account_namespace: AccountNamespace.ETH,
        })
        .onConflict(
          `("owner_account", "account_namespace") DO UPDATE SET "user_id" = EXCLUDED.user_id`
        )
        .execute();
    });

    return {
      ...accountInsert.identifiers[0],
      ...accountInsert.raw[0],
      ...userAccountInsert.identifiers[0],
      ...userAccountInsert.raw[0],
    };
  }

  async createUser(userId: string) {
    try {
      const userCreated: InsertResult = await this.entityManager.insert(
        AccountEntity,
        {
          owner_account: userId,
          account_namespace: AccountNamespace.USR,
          symbol: 'WFAIR',
          balance: '0',
        }
      );

      return {
        ...{ ...userCreated.raw[0], ...userCreated.identifiers[0] },
      };
    } catch (e) {
      console.error('USER CREATION: ', e.message);
      this.rollbackTransaction();
      throw new ModuleException('User creation failed');
    }
  }

  async getUserAccounts(userId: string) {
    return await this.entityManager.find(UserAccount, {
      where: {
        user_id: userId,
      },
    });
  }
}
