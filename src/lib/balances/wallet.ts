import { getRepository } from "typeorm";
import { UserAccount } from "../../db/entities/UserAccount";
import { Account } from "../../db/entities/Account";
import { Beneficiary } from "../models/beneficiary";
import { queryRunner } from "../main";

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
      const accountRepository = getRepository(Account);
      const account = await accountRepository.findOne({ where: { 
        owner_account: beneficiary.owner,
        account_namespace: beneficiary.namespace,
        symbol: beneficiary.symbol,
      }});

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
      const accountRepository = getRepository(Account);
      const account = await accountRepository.findOne({ where: { 
        owner_account: beneficiary.owner,
        account_namespace: beneficiary.namespace,
        symbol: beneficiary.symbol,
      }});

      const newBalance = account.balance - amount;

      if (newBalance < 0) {
        throw new ModuleException(`Owner can't burn more than it owns!
        -- Owner: ${beneficiary.owner} owns: ${account.balance} burns: ${amount}`);
      }

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
      const accountRepository = getRepository(Account);
      const senderAccount = await accountRepository.findOne({ where: { 
        owner_account: sender.owner,
        account_namespace: sender.namespace,
        symbol: sender.symbol,
      }});

      if (senderAccount.balance < amount) {
        throw new ModuleException(`Sender can't spend more than it owns! 
        Sender: ${sender} -- Receiver: ${receiver} -- senderBalance: ${senderAccount.balance} -- amount: ${amount}`);
      }

      const receiverAccount = await accountRepository.findOne({ where: { 
        owner_account: receiver.owner,
        account_namespace: receiver.namespace,
        symbol: receiver.symbol, 
      }});

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
};