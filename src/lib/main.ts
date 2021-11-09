import { createConnection, getConnection } from 'typeorm';
import config from '../db/config';

export const isThisTrue = () => {
  return true;
};

export const initDb = async () => {
  await createConnection(config);
};

export const queryRunner = getConnection().createQueryRunner();
