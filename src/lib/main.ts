import { createConnection } from 'typeorm';
import config from '../db/config';

export const ONE = BigInt(10 ** 18);

export const initDb = async () => {
  await createConnection(config);
};
