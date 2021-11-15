import { EntityManager } from 'typeorm';
import { getEntityManager } from '.';

export class BaseModule {
  entityManager: EntityManager;

  constructor(entityManager?: EntityManager) {
    try {
      this.entityManager = entityManager || getEntityManager();
    } catch (e) {
      console.error(e.message);
    }
  }

  async rollbackTransaction() {
    if (this.entityManager.queryRunner.isTransactionActive) {
      await this.entityManager.queryRunner.rollbackTransaction();
      await this.entityManager.release();
    }
  }
}
