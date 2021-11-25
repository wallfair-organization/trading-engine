import { Connection, EntityManager } from 'typeorm';
import config from './config/db-config';
import dotenv from 'dotenv';
import { User } from '../db/entities/User';
import { Account } from '../db/entities/Account';
import { AccountNamespace } from '../lib/models';
import { Wallet } from '../lib/modules';
import { ModuleException } from '../lib/modules/exceptions/module-exception';
import BigNumber from 'bignumber.js';
import { initDb } from "../lib/main";

dotenv.config();
jest.setTimeout(1000000);

const USER_ID = '615bf607f04fbb15aa5dd367';
const WFAIR = 'WFAIR';
const beneficiary = {
  owner: USER_ID,
  namespace: AccountNamespace.USR,
  symbol: WFAIR,
};
const sender = {
  owner: 'sender',
  namespace: AccountNamespace.USR,
  symbol: WFAIR,
};
const receiver = {
  owner: 'receiver',
  namespace: AccountNamespace.USR,
  symbol: WFAIR,
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
  connection = await initDb(config);
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
  account.symbol = WFAIR;
  account.balance = '0';
  await entityManager.save(account);

  const user = new User();
  user.user_id = USER_ID;
  user.accounts = [account];
  await entityManager.save(user);
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
    await expect(wallet.getBalance('unknown')).rejects.toThrow(ModuleException);
  });
});

describe('Test mint', () => {
  test('when user exists', async () => {
    const amount = 10;
    const account = await entityManager.findOne(Account, {
      where: { owner_account: USER_ID },
    });
    const result = await wallet.mint(beneficiary, amount.toString());

    const newBalance = result.raw[0].balance;
    expect(new BigNumber(account.balance).plus(amount).toString()).toBe(
      newBalance
    );
  });

  test('with negative amount', async () => {
    const amount = -5;
    await expect(wallet.mint(beneficiary, amount.toString())).rejects.toThrow(
      ModuleException
    );
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
        symbol: WFAIR,
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
});

describe('Test burn', () => {
  test('when user exists', async () => {
    const amount = 5;
    const updated = await entityManager.save(Account, {
      owner_account: USER_ID,
      account_namespace: AccountNamespace.USR,
      symbol: WFAIR,
      balance: amount.toString(),
    });
    const oldBalance = updated.balance;

    const result = await wallet.burn(beneficiary, amount.toString());

    const newBalance = result.raw[0].balance;
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
  });

  test('with exceeded balance', async () => {
    await entityManager.save(Account, {
      owner_account: USER_ID,
      account_namespace: AccountNamespace.USR,
      symbol: WFAIR,
      balance: '20',
    });

    await expect(wallet.burn(beneficiary, '30')).rejects.toThrow(
      ModuleException
    );
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
});
