import { createConnection } from 'typeorm';
import config from '../db/config';

export const initDb = async () => {
  await createConnection(config);
};
