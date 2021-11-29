import { Connection, createConnection, EntityManager } from 'typeorm';
import config from './config/db-config';
import {
  AccountNamespace,
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
  NetworkCode,
} from '../lib/models';
import { ModuleException } from '../lib/modules/exceptions/module-exception';
import { ExternalTransaction } from '../db/entities/ExternalTransaction';
import { Account } from '../db/entities/Account';
import { User } from '../db/entities/User';
import { Transaction } from '../db/entities/Transaction';
import { TransactionManager } from '../lib/modules';

let entityManager: EntityManager;
let connection: Connection;

const USER_ID = '615bf607f04fbb15aa5dd367';
const WFAIR = 'WFAIR';
const beneficiary = {
  owner: USER_ID,
  namespace: AccountNamespace.USR,
  symbol: WFAIR,
};
const externalTransaction = {
  originator: ExternalTransactionOriginator.DEPOSIT,
  external_system: 'deposit',
  status: ExternalTransactionStatus.NEW,
  external_transaction_id: '0xdeposit',
  network_code: NetworkCode.ETH,
};

beforeAll(async () => {
  connection = await createConnection(config);
  entityManager = new EntityManager(connection, connection.createQueryRunner());
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

afterEach(async () => {
  await entityManager.delete(Transaction, {});
  await entityManager.delete(ExternalTransaction, {});
});

describe('Successful transaction', () => {
  test('should commit', async () => {
    const transactionManager = new TransactionManager();

    await transactionManager.startTransaction();

    await transactionManager.wallet.mint(beneficiary, '100');
    await transactionManager.transactions.insertExternalTransaction(
      externalTransaction
    );

    await transactionManager.commitTransaction();

    const account = await entityManager.findOne(Account, {
      where: { owner_account: USER_ID },
    });
    const externalTransactionsCount = await entityManager.count(
      ExternalTransaction
    );

    expect(account.balance).toBe('100');
    expect(externalTransactionsCount).toBe(1);
  });
});

describe('Failed transaction', () => {
  test('should automatically rollback', async () => {
    const transactionManager = new TransactionManager();

    await transactionManager.startTransaction();

    await transactionManager.wallet.mint(beneficiary, '100');

    await expect(
      transactionManager.transactions.insertExternalTransaction({
        ...externalTransaction,
        status: null,
      })
    ).rejects.toThrow(ModuleException);

    await transactionManager.commitTransaction();

    const account = await entityManager.findOne(Account, {
      where: { owner_account: USER_ID },
    });
    const externalTransactionsCount = await entityManager.count(
      ExternalTransaction
    );

    expect(account.balance).toBe('0');
    expect(externalTransactionsCount).toBe(0);
  });

  test('should rollback when transaction rollback is called', async () => {
    const transactionManager = new TransactionManager();

    await transactionManager.startTransaction();

    await transactionManager.wallet.mint(beneficiary, '100');

    Promise.reject('Stub reject').catch(
      async () => await transactionManager.rollbackTransaction()
    );

    const account = await entityManager.findOne(Account, {
      where: { owner_account: USER_ID },
    });

    expect(account.balance).toBe('0');
  });
});
