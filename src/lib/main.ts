import { createConnection } from 'typeorm';
import { BigNumber } from 'bignumber.js';
import config from '../db/config';

export const ONE = BigInt(10 ** 18);

BigNumber.set({ DECIMAL_PLACES: 18 });
export { BigNumber as BN };

export const initDb = async () => {
  return await createConnection(config);
};
