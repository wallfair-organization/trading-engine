import { Connection, createConnection, EntityManager } from 'typeorm';
import config from './config/db-config';
import { Account } from '../lib/modules';
import { Account as AccountEntity } from '../db/entities/Account';
import { AccountNamespace } from '../lib/models';
import { ModuleException } from '../lib/modules/exceptions/module-exception';
import { User } from '../db/entities/User';

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
  test('when both user and account exist', async () => {
    const walletOwner = '0xnewwallet';
    await insertAccount(walletOwner);

    const user = await entityManager.find(User, { user_id: USER_ID });
    const accountEntity = await findAccount(walletOwner);
    expect(user).toBeTruthy();
    expect(accountEntity.users.length).toBeFalsy();

    const result = await account.linkEthereumAccount(USER_ID, walletOwner);
    expect(result.users.length).toBeGreaterThan(0);
  });

  test('when user does not exist but account does', async () => {
    const walletOwner = '0xwalletwithoutuser';
    const userId = 'non-existing-user-id';
    await insertAccount(walletOwner);

    const user = await entityManager.findOne(User, { user_id: userId });
    const accountEntity = await findAccount(walletOwner);
    expect(user).toBeUndefined();
    expect(accountEntity.users.length).toBeFalsy();

    const result = await account.linkEthereumAccount(userId, walletOwner);
    expect(result.users.length).toBeGreaterThan(0);
  });

  test('when account does not exist but user does', async () => {
    const walletOwner = 'non-existing-account';

    const user = await entityManager.findOne(User, { user_id: USER_ID });
    const accountEntity = await findAccount(walletOwner);
    expect(user).toBeTruthy();
    expect(accountEntity).toBeUndefined();

    const result = await account.linkEthereumAccount(USER_ID, walletOwner);
    expect(result.users.length).toBeGreaterThan(0);
  });

  test('when account is linked to another user', async () => {
    const walletOwner = '0xwalletlinked';
    const userId = '0xuserlinked';
    await entityManager.save(AccountEntity, {
      owner_account: walletOwner,
      account_namespace: AccountNamespace.ETH,
      symbol: WFAIR,
      balance: '0',
      users: [
        {
          user_id: userId,
        },
      ],
    });

    const accountEntity = await findAccount(walletOwner);
    expect(accountEntity.users.find((u) => u.user_id == userId)).toBeTruthy();

    const result = await account.linkEthereumAccount(USER_ID, walletOwner);
    expect(
      accountEntity.users.find((u) => u.user_id == USER_ID)
    ).toBeUndefined();
    expect(result.users.find((u) => u.user_id === USER_ID)).toBeTruthy();
  });

  test('when already linked', async () => {
    await expect(
      account.linkEthereumAccount(USER_ID, WALLET_ACCOUNT)
    ).resolves.not.toThrow(ModuleException);
  });
});

describe('Test user creation', () => {
  test('when successful', async () => {
    const userId = 'new_user_id';
    await account.createUser(userId);

    const user = entityManager.findOne(User, { user_id: userId });
    const userAccount = entityManager.findOne(AccountEntity, {
      owner_account: userId,
    });

    expect(user).toBeTruthy();
    expect(userAccount).toBeTruthy();
  });

  test('when already exists', async () => {
    const userId = 'new_user_id_fail';
    await entityManager.insert(User, { user_id: userId });

    await expect(account.createUser(userId)).rejects.toThrow(ModuleException);
  });
});

describe('Test get user accounts', () => {
  test('when user has accounts', async () => {
    const userId = 'user_with_accounts';
    await entityManager.save(AccountEntity, {
      owner_account: 'account_with_users',
      account_namespace: AccountNamespace.ETH,
      symbol: WFAIR,
      balance: '0',
      users: [
        {
          user_id: userId,
        },
      ],
    });

    const result = await account.getUserAccounts(userId);
    expect(result.length).toBeTruthy();
  });

  test('when user does not have any accounts', async () => {
    const userId = 'user_without_accounts';
    await entityManager.insert(User, { user_id: userId });

    const result = await account.getUserAccounts(userId);
    expect(result.length).toBeFalsy();
  });
});

const insertAccount = async (owner: string) => {
  return await entityManager
    .createQueryBuilder()
    .insert()
    .into(AccountEntity)
    .values({
      owner_account: owner,
      account_namespace: AccountNamespace.ETH,
      symbol: WFAIR,
      balance: '0',
    })
    .returning('*')
    .execute();
};

const findAccount = async (owner: string) => {
  return await entityManager.findOne(AccountEntity, {
    where: {
      owner_account: owner,
      account_namespace: AccountNamespace.ETH,
      symbol: 'WFAIR',
    },
    relations: ['users'],
  });
};
