import { createConnection } from 'typeorm';
import { BigNumber } from 'bignumber.js';
import config from '../db/config';
import { BN } from '..';

export const dbConfig = config;

export const ONE = BigInt(10 ** 18);

export const WFAIR_SYMBOL = 'WFAIR';

BigNumber.set({ DECIMAL_PLACES: 18 });
export { BigNumber as BN };

export const initDb = async () => {
  return await createConnection(config);
};

export const toWei = (number: number | string): BN => {
  return new BN(number).multipliedBy(ONE.toString()).dp(18);
};

export const fromWei = (number: string): BN => {
  return new BN(number).dividedBy(ONE.toString());
};
