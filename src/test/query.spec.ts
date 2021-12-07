import { createConnection, Connection } from 'typeorm';
import { Query } from '../lib/modules';
import config from './config/db-config';

let connection: Connection;
let queryRunner: Query;

beforeAll(async () => {
  connection = await createConnection(config);
  queryRunner = new Query();
  await connection.query(
    `INSERT INTO account(owner_account, account_namespace, symbol, balance) VALUES($1, $2, $3, $4) RETURNING *`,
    ['test', 'usr', 'wfair', '0']
  );
});

afterAll(async () => {
  await connection.dropDatabase();
  await connection.close();
});

describe('SELECT', () => {
  it('returns results', async () => {
    const result = await queryRunner.query(`SELECT * FROM account`);
    expect(result.length).toBeTruthy();
  });

  it('does not return results', async () => {
    const result = await queryRunner.query(
      `SELECT * FROM account WHERE owner_account = $1`,
      ['unknown']
    );
    expect(result.length).toBeFalsy();
  });
});

describe('INSERT', () => {
  it('inserts a record with returning', async () => {
    const result = await queryRunner.query(
      `INSERT INTO account(owner_account, account_namespace, symbol, balance) VALUES($1, $2, $3, $4) RETURNING *`,
      ['test-insertion', 'usr', 'wfair', '0']
    );
    expect(result.length).toBeTruthy();
  });

  it('inserts a record without returning', async () => {
    const result = await queryRunner.query(
      `INSERT INTO account(owner_account, account_namespace, symbol, balance) VALUES($1, $2, $3, $4)`,
      ['test-insertion-no-return', 'usr', 'wfair', '0']
    );
    expect(result.length).toBeFalsy();
  });
});

describe('UPDATE', () => {
  it('updates a record with return', async () => {
    const result = await queryRunner.query(
      `UPDATE account SET balance = $1 WHERE owner_account = $2 RETURNING *`,
      ['100', 'test']
    );
    expect(result[1]).toBe(1);
    expect(result[0].length).toBe(1);
  });

  it('updates a record without return', async () => {
    const result = await queryRunner.query(
      `UPDATE account SET balance = $1 WHERE owner_account = $2`,
      ['200', 'test']
    );
    expect(result[1]).toBe(1);
    expect(result[0].length).toBeFalsy();
  });
});

describe('DELETE', () => {
  it('deletes a record', async () => {
    const result = await queryRunner.query(
      `DELETE FROM account WHERE owner_account = $1`,
      ['test']
    );
    expect(result[1]).toBe(1);
  });
});
