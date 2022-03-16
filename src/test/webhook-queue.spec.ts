import { Connection, createConnection, EntityManager } from 'typeorm';
import { WebhookQueue } from '../db/entities/WebhookQueue';
import { WebhookQueueOriginator, WebhookQueueStatus } from '../lib/models';
import { Webhook } from '../lib/modules';
import { ModuleException } from '../lib/modules/exceptions/module-exception';
import config from './config/db-config';

let connection: Connection;
let enttityManager: EntityManager;
let webhook: Webhook;

beforeAll(async () => {
  connection = await createConnection(config);
  enttityManager = new EntityManager(connection);
  webhook = new Webhook();
});

afterAll(async () => {
  await connection.dropDatabase();
  await connection.close();
});

const object = {
  key1: 'value1',
  key2: 'value2',
};

describe('Test webhook queue insertion', () => {
  test('when successful', async () => {
    const result = await webhook.insertWebhookQueue(
      WebhookQueueOriginator.DEPOSIT,
      JSON.stringify(object),
      'request_id',
      'order_successful',
      'Error'
    );

    expect(result.raw.length).toBeTruthy();
  });

  test('when already exists', async () => {
    const wq = await enttityManager.insert(WebhookQueue, {
      originator: WebhookQueueOriginator.DEPOSIT,
      request: JSON.stringify({ test: 'list' }),
      request_id: 'request_id',
      request_status: 'existing',
      status: WebhookQueueStatus.FAILED,
      error: 'Something failed',
    });

    const result = await webhook.insertWebhookQueue(
      WebhookQueueOriginator.DEPOSIT,
      JSON.stringify(object),
      'request_id',
      'existing',
      'Different error'
    );

    const afterUpsert = await enttityManager.findOne(
      WebhookQueue,
      wq.raw[0].id
    );

    expect(afterUpsert.error).toBe(result.raw[0].error);
    expect(afterUpsert.attempts).toBe(wq.raw[0].attempts + 1);
  });

  test('when it fails', async () => {
    await expect(
      webhook.insertWebhookQueue(
        WebhookQueueOriginator.DEPOSIT,
        undefined,
        'request_id',
        'order_successful',
        'Error'
      )
    ).rejects.toThrow(ModuleException);
  });
});

describe('Test fetching webhook queue by status', () => {
  test('when records are found', async () => {
    await enttityManager.save(WebhookQueue, {
      originator: WebhookQueueOriginator.DEPOSIT,
      request: JSON.stringify({ test: 'list' }),
      request_id: 'request_id',
      request_status: 'fetching',
      status: WebhookQueueStatus.RESOLVED,
      error: 'Something failed',
    });

    const result = await webhook.getWebhookQueue(
      WebhookQueueOriginator.DEPOSIT,
      WebhookQueueStatus.RESOLVED
    );

    expect(result.length).toBeTruthy();
  });

  test('when records do not exist', async () => {
    await enttityManager.delete(WebhookQueue, {});

    const result = await webhook.getWebhookQueue(
      WebhookQueueOriginator.DEPOSIT,
      WebhookQueueStatus.FAILED
    );

    expect(result.length).toBeFalsy();
  });
});

describe('Test webhook queue update', () => {
  test('when successful', async () => {
    const webhookQueue = await enttityManager.save(WebhookQueue, {
      originator: WebhookQueueOriginator.DEPOSIT,
      request: JSON.stringify({ test: 'update' }),
      request_id: 'request_id',
      request_status: 'updating',
      status: WebhookQueueStatus.FAILED,
      error: 'Something failed',
    });

    await webhook.updateStatus(webhookQueue.id, WebhookQueueStatus.RESOLVED);

    const afterUpdate = await enttityManager.findOne(
      WebhookQueue,
      webhookQueue.id
    );

    expect(afterUpdate.status).toBe(WebhookQueueStatus.RESOLVED);
    expect(afterUpdate.status).not.toBe(webhookQueue.status);
  });

  test('when it fails', async () => {
    await expect(
      webhook.updateStatus('uknown', WebhookQueueStatus.RESOLVED)
    ).rejects.toThrow(ModuleException);
  });
});
