import {
  Connection,
  EntityManager,
  createConnection,
  Not,
  IsNull,
} from 'typeorm';
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
import { ExternalTransactionLog } from '../db/entities/ExternalTransactionLog';

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
    const result = await transactions.getTransactionQueueByStatuses(
      [status],
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
    const result = await transactions.getTransactionQueueByStatuses(
      [status],
      NetworkCode.ETH,
      ExternalTransactionOriginator.WITHDRAW
    );
    expect(result.length).toBeFalsy();
  });
});

describe('Test get external transaction by external id', () => {
  test('when found', async () => {
    const stub = await insertExternalTransaction();
    const result = await transactions.getExternalTransactionForUpdate(
      stub.external_transaction_id
    );
    expect(result).not.toBeUndefined();
  });

  test('when not found', async () => {
    const result = await transactions.getExternalTransactionForUpdate(
      'unknown'
    );
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

describe('Test find external transaction log', () => {
  test('when it is successful', async () => {
    const sender = '0xsomeuser';

    await entityManager.save(ExternalTransactionLog, {
      ...externalTransactionModel,
      sender,
    });

    const transactionLogs = await transactions.getExternalTransactionLogs({
      sender,
    });
    expect(transactionLogs.length).toBe(1);
  });
});

describe('Test get last external by block number', () => {
  test('when there are entries with block number', async () => {
    const block1 = 1;
    const block2 = 2;

    const template = {
      originator: ExternalTransactionOriginator.DEPOSIT,
      external_system: 'deposit',
      status: ExternalTransactionStatus.COMPLETED,
      external_transaction_id: '0xdeposit',
      network_code: NetworkCode.ETH,
    };

    const firstTransaction = {
      ...template,
      block_number: block1,
    };

    const secondTransaction = {
      ...template,
      block_number: block2,
    };

    await entityManager.save(ExternalTransaction, [
      firstTransaction,
      secondTransaction,
    ]);

    const result = await transactions.getLastExternalByBlockNumber(
      ExternalTransactionOriginator.DEPOSIT,
      ExternalTransactionStatus.COMPLETED,
      NetworkCode.ETH
    );

    expect(result.block_number).toBe(secondTransaction.block_number);
  });

  test('when entries with block number do not exist', async () => {
    await entityManager.delete(TransactionQueue, {});
    await entityManager.delete(ExternalTransaction, {
      block_number: Not(IsNull()),
    });
    await entityManager.insert(ExternalTransaction, {
      ...externalTransactionModel,
      originator: ExternalTransactionOriginator.DEPOSIT,
      status: ExternalTransactionStatus.COMPLETED,
      network_code: NetworkCode.ETH,
    });

    const result = await transactions.getLastExternalByBlockNumber(
      ExternalTransactionOriginator.DEPOSIT,
      ExternalTransactionStatus.COMPLETED,
      NetworkCode.ETH
    );

    expect(result).toBeUndefined();
  });
});

describe('Test search', () => {
  test('when search matches the criteria', async () => {
    await entityManager.delete(ExternalTransaction, {});
    await entityManager.insert(ExternalTransaction, externalTransactionModel);

    const searchResult = await transactions.searchExternalTransaction({
      originator: externalTransactionModel.originator,
    });

    expect(searchResult.length).toBeTruthy();
  });

  test('when entries not found', async () => {
    await entityManager.delete(ExternalTransaction, {});

    const searchResult = await transactions.searchExternalTransaction({
      originator: externalTransactionModel.originator,
    });

    expect(searchResult.length).toBeFalsy();
  });
});

describe('Test find external transaction by hash', () => {
  const hash = '0xtransactionhash';
  test('when found', async () => {
    await entityManager.delete(ExternalTransaction, {});
    await entityManager.insert(ExternalTransaction, {
      ...externalTransactionModel,
      transaction_hash: hash,
    });

    const externalTransaction = await transactions.getExternalTransactionByHash(
      hash
    );

    expect(externalTransaction).toBeTruthy();
  });

  test('when not found', async () => {
    await entityManager.delete(ExternalTransaction, {});

    const externalTransaction = await transactions.getExternalTransactionByHash(
      '0xunknown'
    );

    expect(externalTransaction).toBeFalsy();
  });
});

describe('Test find external transaction by hash', () => {
  const hash = '0xtransactionhash';
  test('when found', async () => {
    await entityManager.delete(ExternalTransactionLog, {});
    await entityManager.insert(ExternalTransactionLog, {
      ...externalTransactionModel,
      transaction_hash: hash,
    });

    const externalTransaction =
      await transactions.getExternalTransactionLogByHash(hash);

    expect(externalTransaction).toBeTruthy();
  });

  test('when not found', async () => {
    await entityManager.delete(ExternalTransactionLog, {});

    const externalTransaction =
      await transactions.getExternalTransactionLogByHash('0xunknown');

    expect(externalTransaction).toBeFalsy();
  });
});
