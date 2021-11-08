import test from 'ava';

import { isThisTrue } from './main';

test('dummy test', (t) => {
  t.is(isThisTrue(), true);
});
