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
    }
  }

  async mint(beneficiary: Beneficiary, amount) {
    try {
      // REV: you read the balance then update it in the code and then write it back? it's very wrong
      // REV: at least you must read with FOR UPDATE but really this is not necessary. Just UPDATE SET balance = balance + amount
      // REV: I hope this orm allows for that.
      const account = await this.findAccount(beneficiary);
      account.balance = new BigNumber(account.balance)
        .plus(new BigNumber(amount))
        .toString();
      await this.entityManager.save(account);
    } catch (e) {
      console.error('MINTING ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Failed to fetch balance');
    }
  }

  async burn(beneficiary: Beneficiary, amount) {
    try {
      // REV: see the transfer function. read account state and then burn is wrong. just burn and let the contraint handle the negative values for you
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
    }
  }

  async transfer(sender: Beneficiary, receiver: Beneficiary, amountToTransfer) {
    const amount = new BigNumber(amountToTransfer);

    if (amount.isNegative() || amount.isZero()) {
      throw new ModuleException('Amount validation failed');
    }

    try {
      // REV: this cannot work like this. I think we discussed that many times
      // REV: you cannot read the account balance and then update it. if you do it you need at least REPEATABLE READ tx and we know it
      // REV: fails even with few users
      // REV: this is crucial part and we need to opimize this. what you need to do is to use UPDATE ... ON CONFLICT to create/update account
      // REV: preferably on both accounts in the same call to database
      // REV: if there's not enough balance the contraint will raise and you need to catch it and rethrow with the nice message
      // REV: if the ORM is not supporting that, we do it without ORM. this is the crucial operation in the engine
      const senderAccount = await this.findAccount(sender);
      const senderBalance = new BigNumber(senderAccount.balance);

      // both Beneficiary objects must have the same symbol. where is the check?
      if (senderBalance.isLessThan(amount)) {
        // also dump symbol here
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
