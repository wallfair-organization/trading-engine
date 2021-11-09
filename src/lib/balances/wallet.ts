import { getConnection, getRepository } from "typeorm";
import { UserAccount } from "../../db/entities/UserAccount";
import { Account } from "../../db/entities/Account";
import { Beneficiary } from "../models/beneficiary";

export class Wallet {
  one: number;

  constructor() {
    this.one = 10 ** 18;
  }

  async getBalance(userId: string) {
    const accountRepository = getRepository(UserAccount);
    const userAccount = await accountRepository
      .findOne({ where: { user_id: userId }, relations: ['account'] });
    return userAccount.account.balance / this.one;
  }

  async mint(beneficiary: Beneficiary, amount) {
    if (amount <= 0) {
      throw new ModuleException('Amount validation failed');
    }

    try {
      const account = await this.findAccount(beneficiary);
      const accountRepository = getRepository(Account);
      await accountRepository.save({
        ...account,
        balance: account.balance + amount
      });
    } catch (e) {
      throw new ModuleException('Minting failed');
    }
  }

  async burn(beneficiary: Beneficiary, amount) {
    if (amount <= 0) {
      throw new ModuleException('Amount validation failed');
    }

    try {
      const account = await this.findAccount(beneficiary);
      const newBalance = account.balance - amount;

      if (newBalance < 0) {
        throw new ModuleException(`Owner can't burn more than it owns!
        -- Owner: ${beneficiary.owner} owns: ${account.balance} burns: ${amount}`);
      }

      const accountRepository = getRepository(Account);
      await accountRepository.save({
        ...account,
        balance: newBalance,
      });
    } catch (e) {
      throw new ModuleException(e.message);
    }
  }

  async transfer(sender: Beneficiary, receiver: Beneficiary, amount) {
    if (amount <= 0) {
      throw new ModuleException('Amount validation failed');
    }

    try {
      const senderAccount = await this.findAccount(sender);

      if (senderAccount.balance < amount) {
        throw new ModuleException(`Sender can't spend more than it owns! 
        Sender: ${sender} -- Receiver: ${receiver} -- senderBalance: ${senderAccount.balance} -- amount: ${amount}`);
      }

      const receiverAccount = await this.findAccount(receiver);

      const queryRunner = getConnection().createQueryRunner();
      await queryRunner.startTransaction();
      await queryRunner.manager.save({
        ...senderAccount,
        balance: senderAccount.balance - amount
      });
      await queryRunner.manager.save({
        ...receiverAccount,
        balance: receiverAccount.balance + amount
      });
      await queryRunner.commitTransaction();
    } catch (e) {
      throw new ModuleException(e.message);
    }
  }

  private async findAccount(beneficiary: Beneficiary): Promise<Account> {
    const accountRepository = getRepository(Account);
    return await accountRepository.findOneOrFail({ where: { 
      owner_account: beneficiary.owner,
      account_namespace: beneficiary.namespace,
      symbol: beneficiary.symbol,
    }});
  }
};