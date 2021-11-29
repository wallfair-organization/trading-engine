import { createConnection, getConnectionManager } from 'typeorm';
import config from '../db/config';

export const ONE = BigInt(10 ** 18);

export const initDb = async () => {
  await createConnection(config);
};

export const closeAllConnections = async () => {
    for (const connection of getConnectionManager().connections) {
      await connection.close();
    }
};
