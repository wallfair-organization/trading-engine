import { createConnection, getConnectionManager } from 'typeorm';
import config from '../db/config';

export const initDb = async (dbConfig = null) => {
  return await createConnection(dbConfig ? dbConfig : config);
};

export const closeAllConnections = async () => {
  for (const connection of getConnectionManager().connections) {
    await connection.close();
  }
};
