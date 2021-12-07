import { EntityManager } from 'typeorm';
import { BaseModule } from './base-module';

export class Query extends BaseModule {
  constructor(entityManager?: EntityManager) {
    super(entityManager);
  }

  async query(query: string, params?: any[]) {
    return await this.entityManager.query(query, params);
  }
}
