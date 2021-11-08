import test from 'ava';
import { initDb } from '..';

import { isThisTrue } from './main';

test('dummy test', (t) => {
  t.is(isThisTrue(), true);
});

test('connection', async (t) => {
  await initDb();
  t.is(true, true);
});
