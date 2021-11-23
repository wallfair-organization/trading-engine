import { EntityManager, InsertResult } from 'typeorm';
import { User } from '../../db/entities/User';
import { Account } from '../../db/entities/Account';
import { Beneficiary } from '../models/beneficiary';
import { BaseModule } from './base-module';
import { ModuleException } from './exceptions/module-exception';

export class Wallet extends BaseModule {
  one: number;

  constructor(entityManager?: EntityManager) {
    super(entityManager);
    this.one = 10 ** 18;
  }

  async getBalance(userId: string) {
    try {
      const user = await this.entityManager
        .createQueryBuilder(User, 'user')
        .innerJoinAndSelect('user.accounts', 'account')
        .where(
          'user_account.owner_account = :userId AND user_account.user_id = :userId',
          {
            userId,
          }
        )
        .getOneOrFail();
      return user.accounts[0].balance;
    } catch (e) {
      console.error('GET BALANCE ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Failed to fetch balance');
    }
  }

  async mint(beneficiary: Beneficiary, amount: string) {
    try {
      return await this.updateBalance([{ beneficiary, amount }]);
    } catch (e) {
      console.error('MINTING ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Failed to fetch balance');
    }
  }

  async burn(beneficiary: Beneficiary, amount: string) {
    try {
      return await this.updateBalance([{ beneficiary, amount: '-' + amount }]);
    } catch (e) {
      console.error('BURN ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }

  async transfer(
    sender: Beneficiary,
    receiver: Beneficiary,
    amountToTransfer: string
  ) {
    if (sender.symbol !== receiver.symbol) {
      throw new ModuleException('Transfer not allowed');
    }

    try {
      return await this.updateBalance([
        { beneficiary: sender, amount: '-' + amountToTransfer },
        { beneficiary: receiver, amount: amountToTransfer },
      ]);
    } catch (e) {
      console.error('TRANSFER ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }

  private async updateBalance(
    values: { beneficiary: Beneficiary; amount: string }[]
  ): Promise<InsertResult> {
    return await this.entityManager
      .createQueryBuilder()
      .useTransaction(!this.entityManager.queryRunner?.isTransactionActive)
      .insert()
      .into(Account)
      .values(
        values.map((v) => {
          return {
            owner_account: v.beneficiary.owner,
            account_namespace: v.beneficiary.namespace,
            symbol: v.beneficiary.symbol,
            balance: v.amount,
          };
        })
      )
      .onConflict(
        `("owner_account", "account_namespace", "symbol") DO UPDATE SET "balance" = account.balance + EXCLUDED.balance`
      )
      .returning('balance')
      .execute();
  }
}
