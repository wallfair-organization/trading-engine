import { UserAccount } from '../../db/entities/UserAccount';
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
      await this.releaseConnection();
    }
  }

  async findAccount(ethAccount: string) {
    try {
      return await this.findAccountInDb(ethAccount);
    } finally {
      await this.releaseConnection();
    }
  }

  async createAccount(account: Beneficiary, balance: string) {
    try {
      await this.entityManager.insert(AccountEntity, {
        owner_account: account.owner,
        account_namespace: account.namespace,
        symbol: account.symbol,
        balance,
      });
    } catch (e) {
      console.error('CREATE ACCOUNT: ', e.message);
      throw new ModuleException('Create account failed');
    } finally {
      await this.releaseConnection();
    }
  }

  async linkAccount(userId: string, ethAccount: string, balance: string) {
    try {
      const existingAccount = await this.findAccountInDb(ethAccount);

      if (existingAccount) {
        if (existingAccount.user_accounts?.length && 
          existingAccount.user_accounts.find(ua => ua.user_id === userId)) {
            throw new ModuleException('Account already linked');
        }
        
        await this.entityManager.insert(UserAccount, {
          user_id: userId,
          account: existingAccount,
        });
      } else {
        await this.entityManager.insert(UserAccount, {
          user_id: userId,
          account: {
            owner_account: ethAccount,
            account_namespace: AccountNamespace.ETH,
            symbol: 'WFAIR',
            balance,
          },
        });
      }
    } catch (e) {
      console.error('LINK ACCOUNT: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Failed to link account');
    } finally {
      await this.releaseConnection();
    }
  }

  private async findAccountInDb(ethAccount: string) {
    return await this.entityManager.findOne(AccountEntity, {
      where: {
        owner_account: ethAccount,
        account_namespace: AccountNamespace.ETH,
        symbol: 'WFAIR',
      },
      relations: ['user_accounts'],
    });
  }
}
