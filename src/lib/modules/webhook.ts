import { EntityManager } from 'typeorm';
import { WebhookQueue } from '../../db/entities/WebhookQueue';
import { WebhookQueueStatus } from '../models/enums/WebhookQueueStatus';
import { BaseModule } from './base-module';
import { ModuleException } from './exceptions/module-exception';

export class Webhook extends BaseModule {
  constructor(entityManager?: EntityManager) {
    super(entityManager);
  }

  async insertWebhookQueue(
    request: string,
    request_id: string,
    request_status: string,
    error: string
  ) {
    try {
      return await this.entityManager
        .createQueryBuilder()
        .insert()
        .into(WebhookQueue)
        .values({
          request,
          request_id,
          request_status,
          error,
          status: WebhookQueueStatus.FAILED,
        })
        .onConflict(
          `("request_id", "request_status") DO UPDATE SET error = EXCLUDED.error, attempts = webhook_queue.attempts + 1`
        )
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
