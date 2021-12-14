import BigNumber from 'bignumber.js';
import { fromWei, toWei } from '../lib/main';

test('toWei << number', () => {
  const result = toWei(3.14);
  expect(result.toString()).toBe(new BigNumber(3140000000000000000).toString());
});

test('toWei << string', () => {
  const result = toWei('3.14');
  expect(result.toString()).toBe(new BigNumber(3140000000000000000).toString());
});

test('fromWei', () => {
  const result = fromWei('3140000000000000000');
  expect(result.toString()).toBe(new BigNumber(3.14).toString());
});
