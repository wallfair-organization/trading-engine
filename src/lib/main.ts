import { createConnection, getConnectionManager } from 'typeorm';
import config from '../db/config';

export const initDb = async (dbConfig = null) => {
  if (getConnectionManager().has('default')) {
    const connection = getConnectionManager().get('default');
    if (!connection.isConnected) {
      await connection.connect();
    }
    return connection;
  }

  return await createConnection(dbConfig ? dbConfig : config);
};

export const closeAllConnections = async () => {
  for (const connection of getConnectionManager().connections) {
    await connection.close();
  }
};
