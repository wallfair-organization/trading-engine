import { EntityManager } from 'typeorm';
import { WebhookQueue } from '../../db/entities/WebhookQueue';
import { WebhookQueueStatus } from '../models/enums/WebhookQueueStatus';
import { BaseModule } from './base-module';
import { ModuleException } from './exceptions/module-exception';

export class Webhook extends BaseModule {
  constructor(entityManager?: EntityManager) {
    super(entityManager);
  }

  async insertWebhookQueue(request: string, error: string) {
    try {
      return await this.entityManager
        .createQueryBuilder()
        .insert()
        .into(WebhookQueue)
        .values({
          request,
          error,
          status: WebhookQueueStatus.FAILED,
        })
        .updateEntity(false)
        .returning('*')
        .execute();
    } catch (e) {
      console.error('ERROR: ', e.message);
      this.rollbackTransaction();
      throw new ModuleException('Failed to insert webhook queue');
    }
  }

  async getWebhookQueue(status: WebhookQueueStatus) {
    return await this.entityManager.find(WebhookQueue, {
      where: {
        status,
      },
    });
  }

  async updateStatus(id: string, status: WebhookQueueStatus) {
    try {
      return await this.entityManager.update(
        WebhookQueue,
        {
          id,
        },
        {
          status,
        }
      );
    } catch (e) {
      console.error('ERROR: ', e.message);
      this.rollbackTransaction();
      throw new ModuleException(`Failed to update webhook queue with id ${id}`);
    }
  }
}
