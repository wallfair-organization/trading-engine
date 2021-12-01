import { Connection, createConnection, EntityManager } from 'typeorm';
import config from './config/db-config';
import {
  AccountNamespace,
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
  NetworkCode,
  TransactionManager,
} from '..';
import { Account } from '../db/entities/Account';
import { Transaction } from '../db/entities/Transaction';
import { ExternalTransaction } from '../db/entities/ExternalTransaction';
import { ModuleException } from '../lib/modules/exceptions/module-exception';

let connection: Connection;
let entityManager: EntityManager;

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
    const extTrans =
      await transactionManager.transactions.getExternalTransactionForUpdate(
        externalTransaction.external_transaction_id
      );
    await transactionManager.transactions.updateExternalTransaction(
      extTrans.external_transaction_id,
      {
        network_code: NetworkCode.MATIC,
      }
    );

    await transactionManager.commitTransaction();

    const account = await entityManager.findOne(Account, {
      where: { owner_account: USER_ID },
    });
    const externalTransactionUpdated = await entityManager.findOne(
      ExternalTransaction,
      {
        where: {
          external_transaction_id: extTrans.external_transaction_id,
        },
      }
    );

    expect(account.balance).toBe('100');
    expect(externalTransactionUpdated.network_code).not.toBe(
      extTrans.network_code
    );
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
