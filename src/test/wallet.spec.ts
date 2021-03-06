import {
  Connection,
  createConnection,
  EntityManager,
  In,
  IsNull,
} from 'typeorm';
import config from './config/db-config';
import dotenv from 'dotenv';
import { Account } from '../db/entities/Account';
import { AccountNamespace } from '../lib/models';
import { Wallet } from '../lib/modules';
import { ModuleException } from '../lib/modules/exceptions/module-exception';
import BigNumber from 'bignumber.js';
import { Transaction } from '../db/entities/Transaction';
import { toWei, WFAIR_SYMBOL } from '..';

dotenv.config();
jest.setTimeout(1000000);

const USER_ID = '615bf607f04fbb15aa5dd367';
const beneficiary = {
  owner: USER_ID,
  namespace: AccountNamespace.USR,
  symbol: WFAIR_SYMBOL,
};
const sender = {
  owner: 'sender',
  namespace: AccountNamespace.USR,
  symbol: WFAIR_SYMBOL,
};
const receiver = {
  owner: 'receiver',
  namespace: AccountNamespace.USR,
  symbol: WFAIR_SYMBOL,
};

let entityManager: EntityManager;
let connection: Connection;
let wallet: Wallet;

const saveBeneficiaries = async (
  senderBalance: string,
  receiverBalance: string,
  senderOwner = sender.owner
) => {
  await entityManager.save(Account, {
    owner_account: senderOwner,
    account_namespace: sender.namespace,
    symbol: sender.symbol,
    balance: senderBalance,
  });

  await entityManager.save(Account, {
    owner_account: receiver.owner,
    account_namespace: receiver.namespace,
    symbol: receiver.symbol,
    balance: receiverBalance,
  });
};

beforeAll(async () => {
  connection = await createConnection(config);
  entityManager = new EntityManager(connection, connection.createQueryRunner());
  wallet = new Wallet();
});

afterAll(async () => {
  await entityManager.release();
  await connection.dropDatabase();
  await connection.close();
});

beforeEach(async () => {
  const account = new Account();
  account.owner_account = USER_ID;
  account.account_namespace = AccountNamespace.USR;
  account.symbol = WFAIR_SYMBOL;
  account.balance = '0';
  await entityManager.save(account);
});

describe('Test balance', () => {
  test('when account is found', async () => {
    const expectedBalance = '20';
    await entityManager.update(
      Account,
      { owner_account: USER_ID },
      { balance: expectedBalance }
    );
    const balance = await wallet.getBalance(USER_ID);
    expect(balance).toBe(expectedBalance);
  });

  test('when account does not exist', async () => {
    expect(await wallet.getBalance('unknown')).toBe('0');
  });
});

describe('Test balances', () => {
  test('when user has multiple accounts', async () => {
    await entityManager.save(Account, {
      owner_account: USER_ID,
      account_namespace: AccountNamespace.USR,
      symbol: 'BFAIR',
      balance: toWei(100).toString(),
    });
    await entityManager.save(Account, {
      owner_account: USER_ID,
      account_namespace: AccountNamespace.USR,
      symbol: 'PFAIR',
      balance: toWei(200).toString(),
    });

    const balances = await wallet.getBalances(USER_ID);
    expect(balances.length).toBe(3);
  });
});

describe('Test get balances by symbols', () => {
  test('when found', async () => {
    await entityManager.insert(Account, [
      {
        owner_account: 'bet',
        account_namespace: AccountNamespace.BET,
        symbol: '1_bet',
        balance: toWei('1000').toString(),
      },
      {
        owner_account: 'bet',
        account_namespace: AccountNamespace.BET,
        symbol: '0_bet',
        balance: toWei('1000').toString(),
      },
      {
        owner_account: 'user',
        account_namespace: AccountNamespace.BET,
        symbol: '0_bet',
        balance: toWei('1000').toString(),
      },
    ]);

    const balances = await wallet.getBalancesBySymbols(
      ['0_bet', '1_bet'],
      AccountNamespace.BET
    );

    expect(balances.length).toBe(3);
  });

  test('when found with owner', async () => {
    await entityManager.insert(Account, [
      {
        owner_account: 'bet1',
        account_namespace: AccountNamespace.BET,
        symbol: '1_bet1',
        balance: toWei('1000').toString(),
      },
      {
        owner_account: 'bet1',
        account_namespace: AccountNamespace.BET,
        symbol: '0_bet1',
        balance: toWei('1000').toString(),
      },
      {
        owner_account: 'user',
        account_namespace: AccountNamespace.BET,
        symbol: '0_bet1',
        balance: toWei('1000').toString(),
      },
    ]);

    const balances = await wallet.getBalancesBySymbols(
      ['0_bet1', '1_bet1'],
      AccountNamespace.BET,
      'bet1'
    );

    expect(balances.length).toBe(2);
  });

  test('when not found', async () => {
    const balances = await wallet.getBalancesBySymbols(
      ['0_unknown', '1_unknown'],
      AccountNamespace.BET
    );

    expect(balances.length).toBeFalsy();
  });
});

describe('Test mint', () => {
  test('when user exists', async () => {
    const amount = 10;
    const account = await entityManager.findOne(Account, {
      where: {
        owner_account: beneficiary.owner,
        account_namespace: beneficiary.namespace,
        symbol: beneficiary.symbol,
      },
    });
    const result = await wallet.mint(beneficiary, amount.toString());

    const newBalance = result.raw[0].balance;
    const transaction = await entityManager.findOne(Transaction, {
      where: {
        sender_account: IsNull(),
        receiver_account: beneficiary.owner,
        amount: amount.toString(),
      },
    });
    expect(transaction).toBeTruthy();
    expect(new BigNumber(account.balance).plus(amount).toString()).toBe(
      newBalance
    );
  });

  test('with negative amount', async () => {
    const amount = -5;
    await expect(wallet.mint(beneficiary, amount.toString())).rejects.toThrow(
      ModuleException
    );
    const account = await entityManager.findOne(Account, {
      where: {
        owner_account: beneficiary.owner,
        account_namespace: beneficiary.namespace,
        symbol: beneficiary.symbol,
      },
    });
    expect(account.balance).toBe('0');
  });

  test('when user does not exist', async () => {
    const amount = 10;
    const owner = 'newMintUser';
    const account = await entityManager.findOne(Account, {
      where: { owner_account: owner },
    });

    expect(account).toBeUndefined();

    const result = await wallet.mint(
      {
        owner,
        namespace: AccountNamespace.ETH,
        symbol: WFAIR_SYMBOL,
      },
      amount.toString()
    );

    const balance = result.raw[0].balance;

    const newAccount = await entityManager.findOne(Account, {
      where: { owner_account: owner },
    });

    expect(newAccount).toBeTruthy();
    expect(newAccount.balance).toBe(balance);
  });

  test('when 0 amount', async () => {
    const result = await wallet.mint(beneficiary, '0');
    expect(result.identifiers.length).toBeFalsy();
    expect(result.raw.length).toBeFalsy();
  });
});

describe('Test burn', () => {
  test('when user exists', async () => {
    const amount = 5;
    const updated = await entityManager.save(Account, {
      owner_account: beneficiary.owner,
      account_namespace: beneficiary.namespace,
      symbol: beneficiary.symbol,
      balance: amount.toString(),
    });
    const oldBalance = updated.balance;

    const result = await wallet.burn(beneficiary, amount.toString());

    const newBalance = result.raw[0].balance;
    const transaction = await entityManager.findOne(Transaction, {
      where: {
        sender_account: beneficiary.owner,
        receiver_account: IsNull(),
        amount: amount.toString(),
      },
    });
    expect(transaction).toBeTruthy();
    expect(new BigNumber(oldBalance).toNumber()).toBeGreaterThan(
      new BigNumber(newBalance).toNumber()
    );
  });

  test('when user does not exist', async () => {
    const amount = 10;
    const owner = 'newBurnUser';
    const account = await entityManager.findOne(Account, {
      where: { owner_account: owner },
    });
    expect(account).toBeUndefined();

    await expect(wallet.burn(beneficiary, amount.toString())).rejects.toThrow(
      ModuleException
    );

    const accountAfterBurn = await entityManager.findOne(Account, {
      where: { owner_account: owner },
    });
    expect(accountAfterBurn).toBeUndefined();
  });

  test('with exceeded balance', async () => {
    const account = await entityManager.save(Account, {
      owner_account: beneficiary.owner,
      account_namespace: beneficiary.namespace,
      symbol: beneficiary.symbol,
      balance: '20',
    });

    await expect(wallet.burn(beneficiary, '30')).rejects.toThrow(
      ModuleException
    );

    const accountAfterBurn = await entityManager.findOne(Account, {
      where: {
        owner_account: beneficiary.owner,
        account_namespace: beneficiary.namespace,
        symbol: beneficiary.symbol,
      },
    });
    expect(accountAfterBurn.balance).toBe(account.balance);
  });

  test('when 0 amount', async () => {
    const result = await wallet.burn(beneficiary, '0');
    expect(result.identifiers.length).toBeFalsy();
    expect(result.raw.length).toBeFalsy();
  });
});

describe('Test transfer', () => {
  test('when both accounts exist', async () => {
    const senderBalance = '20';
    const receiverBalance = '30';
    const amount = '10';

    await saveBeneficiaries(senderBalance, receiverBalance);

    const result = await wallet.transfer(sender, receiver, amount);

    const senderNewBalance =
      result.raw[
        result.identifiers.findIndex((i) => i.owner_account === sender.owner)
      ].balance;
    const receiverNewBalance =
      result.raw[
        result.identifiers.findIndex((i) => i.owner_account === receiver.owner)
      ].balance;
    const transaction = await entityManager.findOne(Transaction, {
      where: {
        sender_account: sender.owner,
        receiver_account: receiver.owner,
        amount,
      },
    });
    expect(transaction).toBeTruthy();

    expect(
      new BigNumber(senderBalance).minus(new BigNumber(amount)).toString()
    ).toBe(senderNewBalance);
    expect(
      new BigNumber(receiverBalance).plus(new BigNumber(amount)).toString()
    ).toBe(receiverNewBalance);
  });

  test('when one account does not exist', async () => {
    const senderBalance = '20';
    const receiverBalance = '30';
    const amount = '10';
    const senderOwner = 'non-existing-account';

    const senderAccount = await entityManager.findOne(Account, {
      owner_account: senderOwner,
    });

    expect(senderAccount).toBeUndefined();

    await saveBeneficiaries(senderBalance, receiverBalance, senderOwner);

    const result = await wallet.transfer(
      { ...sender, owner: senderOwner },
      receiver,
      amount
    );

    const senderNewBalance =
      result.raw[
        result.identifiers.findIndex((i) => i.owner_account === senderOwner)
      ].balance;
    const receiverNewBalance =
      result.raw[
        result.identifiers.findIndex((i) => i.owner_account === receiver.owner)
      ].balance;

    expect(
      new BigNumber(senderBalance).minus(new BigNumber(amount)).toString()
    ).toBe(senderNewBalance);
    expect(
      new BigNumber(receiverBalance).plus(new BigNumber(amount)).toString()
    ).toBe(receiverNewBalance);
  });

  test('when insufficient funds', async () => {
    const senderBalance = '5';
    const receiverBalance = '30';
    const amount = '10';

    await saveBeneficiaries(senderBalance, receiverBalance);

    await expect(wallet.transfer(sender, receiver, amount)).rejects.toThrow(
      ModuleException
    );

    const senderAccount = await entityManager.findOne(Account, {
      owner_account: sender.owner,
    });
    const receiverAccount = await entityManager.findOne(Account, {
      owner_account: receiver.owner,
    });

    expect(senderAccount.balance).toBe(senderBalance);
    expect(receiverAccount.balance).toBe(receiverBalance);
  });

  test('when symbols are different', async () => {
    await expect(
      wallet.transfer({ ...sender, symbol: 'ETH' }, receiver, '10')
    ).rejects.toThrow(ModuleException);
  });

  test('when 0 amount', async () => {
    const result = await wallet.transfer(sender, receiver, '0');
    expect(result.identifiers.length).toBeFalsy();
    expect(result.raw.length).toBeFalsy();
  });
});

describe('Test burn all', () => {
  test('when successfully burned', async () => {
    const owners = ['burned_1', 'burned_2'];
    for (const o of owners) {
      await entityManager.save(Account, {
        owner_account: o,
        account_namespace: AccountNamespace.USR,
        symbol: WFAIR_SYMBOL,
        balance: toWei(100).toString(),
      });
    }

    const result = await wallet.burnAll(
      owners,
      AccountNamespace.USR,
      WFAIR_SYMBOL
    );

    const balances = await entityManager.find(Account, {
      where: {
        owner_account: In(owners),
      },
    });

    expect(balances.every((b) => b.balance === '0')).toBe(true);
    expect(result.affected).toBe(2);
  });

  test('when no accounts to be burned', async () => {
    const result = await wallet.burnAll(
      ['unknown', 'unknown_2'],
      AccountNamespace.USR,
      WFAIR_SYMBOL
    );
    expect(result.affected).toBe(0);
  });
});
