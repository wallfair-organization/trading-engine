import { EntityManager } from 'typeorm';
import { getEntityManager } from '.';

export class BaseModule {
  protected readonly entityManager: EntityManager;

  constructor(entityManager?: EntityManager) {
    this.entityManager = entityManager || getEntityManager(false);
  }

  async runInTransaction(run: (em: EntityManager) => Promise<any>) {
    if (!this.entityManager.queryRunner?.isTransactionActive) {
      await this.entityManager.transaction(async (em) => {
        await run(em);
      });
    } else {
      await run(this.entityManager);
    }
  }

  async rollbackTransaction() {
    if (this.entityManager.queryRunner?.isTransactionActive) {
      await this.entityManager.queryRunner.rollbackTransaction();
      await this.entityManager.release();
    }
  }
}
