import test from 'ava';

import { isThisTrue } from './dummy';

test('dummy test', (t) => {
  t.is(isThisTrue(), true);
});
