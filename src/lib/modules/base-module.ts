import { EntityManager } from 'typeorm';
import { getEntityManager } from '.';

export class BaseModule {
  protected readonly entityManager: EntityManager;

  constructor(entityManager?: EntityManager) {
    this.entityManager = entityManager || getEntityManager(false);
  }

  async rollbackTransaction() {
    if (this.entityManager.queryRunner?.isTransactionActive) {
      await this.entityManager.queryRunner.rollbackTransaction();
      await this.entityManager.release();
    }
  }
}
