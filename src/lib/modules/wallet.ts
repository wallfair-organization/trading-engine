import { EntityManager, In, InsertResult, IsNull, Not } from 'typeorm';
import { Account } from '../../db/entities/Account';
import { Beneficiary } from '../models/beneficiary';
import { BaseModule } from './base-module';
import { ModuleException } from './exceptions/module-exception';
import { Transaction } from '../../db/entities/Transaction';
import { AccountNamespace } from '../models';
import { BN, WFAIR_SYMBOL } from '../main';

export class Wallet extends BaseModule {
  constructor(entityManager?: EntityManager) {
    super(entityManager);
  }

  async getBalance(
    owner: string,
    namespace = AccountNamespace.USR,
    symbol = WFAIR_SYMBOL
  ) {
    const user = await this.entityManager.findOne(Account, {
      where: {
        owner_account: owner,
        account_namespace: namespace,
        symbol,
      },
    });
    return user?.balance || '0';
  }

  async getBalances(owner: string, namespace = AccountNamespace.USR) {
    return await this.entityManager.find(Account, {
      where: {
        owner_account: owner,
        account_namespace: namespace,
      },
    });
  }

  async getBalancesBySymbols(
    symbols: string[],
    namespace: string,
    owner?: string
  ) {
    return await this.entityManager.find(Account, {
      where: {
        symbol: In(symbols),
        account_namespace: namespace,
        owner_account: owner || Not(IsNull()),
      },
    });
  }

  async mint(beneficiary: Beneficiary, amount: string) {
    if (new BN(amount).isZero()) {
      return {
        identifiers: [],
        raw: [],
      };
    }

    try {
      return await this.updateBalance([{ beneficiary, amount }], {
        sender_namespace: beneficiary.namespace,
        receiver_namespace: beneficiary.namespace,
        receiver_account: beneficiary.owner,
        symbol: beneficiary.symbol,
        amount: amount,
      });
    } catch (e) {
      console.error('MINTING ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException('Failed to fetch balance');
    }
  }

  async burn(beneficiary: Beneficiary, amount: string) {
    if (new BN(amount).isZero()) {
      return {
        identifiers: [],
        raw: [],
      };
    }

    try {
      return await this.updateBalance([{ beneficiary, amount: '-' + amount }], {
        sender_namespace: beneficiary.namespace,
        sender_account: beneficiary.owner,
        receiver_namespace: beneficiary.namespace,
        symbol: beneficiary.symbol,
        amount: amount,
      });
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
    if (new BN(amountToTransfer).isZero()) {
      return {
        identifiers: [],
        raw: [],
      };
    }

    if (sender.symbol !== receiver.symbol) {
      throw new ModuleException('Transfer not allowed');
    }

    try {
      return await this.updateBalance(
        [
          { beneficiary: sender, amount: '-' + amountToTransfer },
          { beneficiary: receiver, amount: amountToTransfer },
        ],
        {
          sender_namespace: sender.namespace,
          sender_account: sender.owner,
          receiver_namespace: receiver.namespace,
          receiver_account: receiver.owner,
          symbol: sender.symbol,
          amount: amountToTransfer,
        }
      );
    } catch (e) {
      console.error('TRANSFER ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }

  async burnAll(owners: string[], namespace: AccountNamespace, symbol: string) {
    try {
      return await this.entityManager.update(
        Account,
        {
          owner_account: In(owners),
          account_namespace: namespace,
          symbol,
        },
        {
          balance: '0',
        }
      );
    } catch (e) {
      console.error('BURN ALL ERROR: ', e.message);
      await this.rollbackTransaction();
      throw new ModuleException(e.message);
    }
  }

  private async updateBalance(
    values: { beneficiary: Beneficiary; amount: string }[],
    transaction: Partial<Transaction>
  ): Promise<InsertResult> {
    let result;

    await this.runInTransaction(async (em: EntityManager) => {
      result = await em
        .createQueryBuilder()
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

      await em.insert(Transaction, transaction);
    });

    return result;
  }
}
