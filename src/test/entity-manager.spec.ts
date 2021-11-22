import { getEntityManager } from '../lib/modules';

describe('Test entity manager', () => {
  test('when connection is closed', async () => {
    const entityManager = getEntityManager(false);
    expect(entityManager).toBeUndefined();
  });
});
