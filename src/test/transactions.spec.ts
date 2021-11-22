import { Connection, EntityManager, createConnection } from 'typeorm';
import config from './config/db-config';
import { Transactions } from '../lib/modules';
import {
  AccountNamespace,
  ExternalTransactionOriginator,
  ExternalTransactionStatus,
  NetworkCode,
} from '../lib/models';
import { ModuleException } from '../lib/modules/exceptions/module-exception';
import { ExternalTransaction } from '../db/entities/ExternalTransaction';
import { TransactionQueue } from '../db/entities/TransactionQueue';

let entityManager: EntityManager;
let connection: Connection;
let transactions: Transactions;

const WFAIR = 'WFAIR';
const externalTransactionModel = {
  originator: ExternalTransactionOriginator.WITHDRAW,
  external_system: 'withdraw',
  status: ExternalTransactionStatus.NEW,
  external_transaction_id: '0xwithdraw',
  network_code: NetworkCode.ETH,
};

const insertExternalTransaction = async (
  withTransactionQueue = false,
  status = ExternalTransactionStatus.NEW
) => {
  const data = {
    ...externalTransactionModel,
    status,
  };

  const result = withTransactionQueue
    ? await entityManager.save(ExternalTransaction, {
        ...data,
        transaction_queue: {
          amount: '100',
          network_code: NetworkCode.ETH,
          receiver: '0xreceiver',
          symbol: WFAIR,
          namespace: AccountNamespace.ETH,
        },
      })
    : await entityManager.save(ExternalTransaction, data);

  return result;
};

beforeAll(async () => {
  connection = await createConnection(config);
  entityManager = new EntityManager(connection, connection.createQueryRunner());
  console.log(entityManager.queryRunner?.isTransactionActive);
  transactions = new Transactions();
});

afterAll(async () => {
  await entityManager.release();
  await connection.dropDatabase();
  await connection.close();
});

describe('Test insert transaction', () => {
  test('when successful', async () => {
    const result = await transactions.insertTransaction({
      sender_account: 'sender',
      receiver_account: 'receiver',
      sender_namespace: AccountNamespace.ETH,
      receiver_namespace: AccountNamespace.ETH,
      symbol: WFAIR,
      amount: '1',
    });

    expect(result.identifiers.length).toBeTruthy();
  });

  test('when it fails', async () => {
    await expect(
      transactions.insertTransaction({
        sender_account: undefined,
        receiver_account: 'receiver',
        sender_namespace: AccountNamespace.ETH,
        receiver_namespace: AccountNamespace.ETH,
        symbol: WFAIR,
        amount: '1',
      })
    ).rejects.toThrow(ModuleException);
  });
});

describe('Test insert external transaction', () => {
  test('when successful', async () => {
    const result = await transactions.insertExternalTransaction({
      originator: ExternalTransactionOriginator.DEPOSIT,
      external_system: 'deposit',
      status: ExternalTransactionStatus.COMPLETED,
      external_transaction_id: '0xext',
      network_code: NetworkCode.ETH,
    });

    expect(result.identifiers.length).toBeTruthy();
  });

  test('when it fails', async () => {
    await expect(
      transactions.insertExternalTransaction({
        originator: ExternalTransactionOriginator.DEPOSIT,
        external_system: 'deposit',
        status: ExternalTransactionStatus.COMPLETED,
        external_transaction_id: '0xext',
        network_code: null,
      })
    ).rejects.toThrow(ModuleException);
  });
});

describe('Test insert transaction queue', () => {
  test('when successful', async () => {
    const result = await transactions.insertTransactionQueue(
      {
        originator: ExternalTransactionOriginator.WITHDRAW,
        external_system: 'withdraw',
        status: ExternalTransactionStatus.NEW,
        external_transaction_id: '0xwithdraw',
        network_code: NetworkCode.ETH,
      },
      {
        amount: '100',
        network_code: NetworkCode.ETH,
        receiver: '0xreceiver',
        symbol: WFAIR,
        namespace: AccountNamespace.ETH,
      }
    );

    expect(result.id).not.toBeUndefined();
  });

  test('when it fails', async () => {
    await expect(
      transactions.insertTransactionQueue(
        {
          originator: ExternalTransactionOriginator.WITHDRAW,
          external_system: 'withdraw',
          status: null,
          external_transaction_id: '0xwithdraw',
          network_code: null,
        },
        {
          amount: null,
          network_code: null,
          receiver: '0xreceiver',
          symbol: WFAIR,
          namespace: AccountNamespace.ETH,
        }
      )
    ).rejects.toThrow(ModuleException);
  });
});

describe('Test update external transaction status', () => {
  test('when successful', async () => {
    const stub = await insertExternalTransaction();

    const updateResult = await transactions.updateTransactionQueueState(
      stub.id,
      ExternalTransactionStatus.SCHEDULED,
      '0xhash'
    );

    const externalTransaction = await entityManager.findOne(
      ExternalTransaction,
      {
        where: { id: stub.id },
      }
    );

    expect(updateResult.affected).toBe(1);
    expect(externalTransaction.status).toBe(
      ExternalTransactionStatus.SCHEDULED
    );
  });

  test('when external transaction does not exist', async () => {
    await expect(
      transactions.updateTransactionQueueState(
        'unknown',
        ExternalTransactionStatus.SCHEDULED,
        '0xhash'
      )
    ).rejects.toThrow(ModuleException);
  });

  test('when it fails', async () => {
    const stub = await insertExternalTransaction();

    await expect(
      transactions.updateTransactionQueueState(stub.id, null, '0xhash')
    ).rejects.toThrow(ModuleException);
  });
});

describe('Test get transaction queue', () => {
  test('when exists', async () => {
    const stub = await insertExternalTransaction(true);
    const result = await transactions.getTransactionQueue(stub.id);
    expect(result.transaction_queue).toBeTruthy();
  });

  test('when it does not exist', async () => {
    const result = await transactions.getTransactionQueue(
      '6ab2c5d7-5f4b-46b0-a545-f2ee71e9d240'
    );
    expect(result).toBeUndefined();
  });
});

describe('Test get transaction queue by status', () => {
  test('when found', async () => {
    const status = ExternalTransactionStatus.SCHEDULED;
    await insertExternalTransaction(true, status);
    const result = await transactions.getTransactionQueueByStatus(
      status,
      NetworkCode.ETH,
      ExternalTransactionOriginator.WITHDRAW
    );
    expect(result.length).toBeTruthy();
  });

  test('when not found', async () => {
    const status = ExternalTransactionStatus.SCHEDULED;
    await entityManager.delete(TransactionQueue, {});
    await entityManager.delete(ExternalTransaction, {
      status,
    });
    const result = await transactions.getTransactionQueueByStatus(
      status,
      NetworkCode.ETH,
      ExternalTransactionOriginator.WITHDRAW
    );
    expect(result.length).toBeFalsy();
  });
});

describe('Test get external transaction by external id', () => {
  test('when found', async () => {
    const stub = await insertExternalTransaction();
    const result = await transactions.getExternalTransaction(
      stub.external_transaction_id
    );
    expect(result).not.toBeUndefined();
  });

  test('when not found', async () => {
    const result = await transactions.getExternalTransaction('unknown');
    expect(result).toBeUndefined();
  });
});

describe('Test update external transaction by external transaction id', () => {
  test('when found', async () => {
    const stub = await insertExternalTransaction();
    const result = await transactions.updateExternalTransaction(
      stub.external_transaction_id,
      {
        status: ExternalTransactionStatus.COMPLETED,
      }
    );
    expect(result.affected).toBeGreaterThan(0);
  });

  test('when not found', async () => {
    const result = await transactions.updateExternalTransaction('unknown', {
      status: ExternalTransactionStatus.COMPLETED,
    });

    expect(result.affected).toBe(0);
  });

  test('when it fails', async () => {
    const stub = await insertExternalTransaction();
    await expect(
      transactions.updateExternalTransaction(stub.external_transaction_id, {
        status: null,
      })
    ).rejects.toThrow(ModuleException);
  });
});

describe('Test insert external transaction log', () => {
  test('when it is successful', async () => {
    const result = await transactions.insertExternalTransactionLog(
      externalTransactionModel
    );
    expect(result.identifiers.length).toBeTruthy();
  });

  test('when it fails', async () => {
    await expect(
      transactions.insertExternalTransactionLog({
        ...externalTransactionModel,
        status: null,
      })
    ).rejects.toThrow(ModuleException);
  });
});
