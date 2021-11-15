import { EntityManager } from 'typeorm';
import { UserAccount } from '../../db/entities/UserAccount';
import { Account } from '../../db/entities/Account';
import { Beneficiary } from '../models/beneficiary';
import BigNumber from 'bignumber.js';
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
      const userAccount = await this.entityManager.findOneOrFail(UserAccount, {
        where: { user_id: userId },
        relations: ['account'],
      });
      return userAccount.account.balance;
    } catch (e) {
      console.error('GET BALANCE ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Failed to fetch balance');
    } finally {
      if (!this.entityManager.queryRunner.isTransactionActive) {
        this.entityManager.release();
      }
    }
  }

  async mint(beneficiary: Beneficiary, amount) {
    try {
      const account = await this.findAccount(beneficiary);
      account.balance = new BigNumber(account.balance)
        .plus(new BigNumber(amount))
        .toString();
      await this.entityManager.save(account);
    } catch (e) {
      console.error('MINTING ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Failed to fetch balance');
    } finally {
      if (!this.entityManager.queryRunner.isTransactionActive) {
        this.entityManager.release();
      }
    }
  }

  async burn(beneficiary: Beneficiary, amount) {
    try {
      const account = await this.findAccount(beneficiary);
      const newBalance = new BigNumber(account.balance).minus(
        new BigNumber(amount)
      );

      if (newBalance.isNegative()) {
        throw new ModuleException(`Owner can't burn more than it owns!
        -- Owner: ${beneficiary.owner} owns: ${account.balance} burns: ${amount}`);
      }

      await this.entityManager.save(Account, {
        ...account,
        balance: newBalance.toString(),
      });
    } catch (e) {
      console.error('BURN ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    } finally {
      if (!this.entityManager.queryRunner.isTransactionActive) {
        this.entityManager.release();
      }
    }
  }

  async transfer(sender: Beneficiary, receiver: Beneficiary, amountToTransfer) {
    const amount = new BigNumber(amountToTransfer);

    if (amount.isNegative() || amount.isZero()) {
      throw new ModuleException('Amount validation failed');
    }

    try {
      const senderAccount = await this.findAccount(sender);
      const senderBalance = new BigNumber(senderAccount.balance);

      if (senderBalance.isLessThan(amount)) {
        throw new ModuleException(`Sender can't spend more than it owns! 
        Sender: ${sender} -- Receiver: ${receiver} -- senderBalance: ${senderAccount.balance} -- amount: ${amount}`);
      }

      const receiverAccount = await this.findAccount(receiver);

      await this.entityManager.save(Account, [
        {
          ...senderAccount,
          balance: senderBalance.minus(amount).toString(),
        },
        {
          ...receiverAccount,
          balance: new BigNumber(receiverAccount.balance)
            .plus(amount)
            .toString(),
        },
      ]);
    } catch (e) {
      console.error('TRANSFER ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    } finally {
      if (!this.entityManager.queryRunner.isTransactionActive) {
        this.entityManager.release();
      }
    }
  }

  private async findAccount(beneficiary: Beneficiary): Promise<Account> {
    return await this.entityManager.findOneOrFail(Account, {
      where: {
        owner_account: beneficiary.owner,
        account_namespace: beneficiary.namespace,
        symbol: beneficiary.symbol,
      },
    });
  }
}
