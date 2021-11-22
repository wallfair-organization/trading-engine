import { Connection, createConnection, EntityManager } from 'typeorm';
import config from './config/db-config';
import { Account } from '../lib/modules';
import { Account as AccountEntity } from '../db/entities/Account';
import { AccountNamespace } from '../lib/models';
import { ModuleException } from '../lib/modules/exceptions/module-exception';

let entityManager: EntityManager;
let connection: Connection;
let account: Account;

const USER_ID = '615bf607f04fbb15aa5dd367';
const WALLET_ACCOUNT = '0xtestwallet';
const WFAIR = 'WFAIR';

beforeAll(async () => {
  connection = await createConnection(config);
  entityManager = new EntityManager(connection, connection.createQueryRunner());
  account = new Account();
});

afterAll(async () => {
  await entityManager.release();
  await connection.dropDatabase();
  await connection.close();
});

beforeEach(async () => {
  await entityManager.save(AccountEntity, {
    owner_account: WALLET_ACCOUNT,
    account_namespace: AccountNamespace.ETH,
    symbol: WFAIR,
    balance: '0',
    users: [
      {
        user_id: USER_ID,
      },
    ],
  });
});

describe('Test if user owns an account', () => {
  test('when true', async () => {
    const result = await account.isUserOwner(USER_ID, WALLET_ACCOUNT);
    expect(result.user_id).toBe(USER_ID);
    expect(result.accounts[0].owner_account).toBe(WALLET_ACCOUNT);
  });

  test('when user does not own an account', async () => {
    await expect(account.isUserOwner(USER_ID, '0xunknown')).rejects.toThrow(
      ModuleException
    );
  });
});

describe('Test find account', () => {
  test('when account exists', async () => {
    const accountEntity = await account.findAccount(WALLET_ACCOUNT);
    expect(accountEntity).toBeTruthy();
  });

  test('when account does not exist', async () => {
    const accountEntity = await account.findAccount('unknown');
    expect(accountEntity).toBeUndefined();
  });
});

describe('Test create account', () => {
  test('when successful', async () => {
    const result = await account.createAccount(
      {
        owner: '0xowner',
        namespace: AccountNamespace.ETH,
        symbol: WFAIR,
      },
      '1000'
    );
    expect(result.identifiers.length).toBeTruthy();
  });

  test('when it fails', async () => {
    await expect(
      account.createAccount(
        {
          owner: '0xfailure',
          namespace: AccountNamespace.ETH,
          symbol: WFAIR,
        },
        '-1'
      )
    ).rejects.toThrow(ModuleException);
  });
});

describe('Test link account', () => {
  test('when successful', async () => {
    const walletOwner = '0xnewwallet';
    await entityManager.insert(AccountEntity, {
      owner_account: walletOwner,
      account_namespace: AccountNamespace.ETH,
      symbol: WFAIR,
      balance: '0',
    });
    await expect(
      account.linkEthereumAccount(USER_ID, walletOwner)
    ).resolves.not.toThrow(ModuleException);
  });

  test('when user does not exist', async () => {
    const walletOwner = '0xwalletwithoutuser';
    await entityManager.insert(AccountEntity, {
      owner_account: walletOwner,
      account_namespace: AccountNamespace.ETH,
      symbol: WFAIR,
      balance: '0',
    });
    await expect(
      account.linkEthereumAccount('non-existing-user-id', walletOwner)
    ).resolves.not.toThrow(ModuleException);
  });

  test('when already linked', async () => {
    await expect(
      account.linkEthereumAccount(USER_ID, WALLET_ACCOUNT)
    ).rejects.toThrow(ModuleException);
  });
});
