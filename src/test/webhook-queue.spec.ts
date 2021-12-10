import { Connection, createConnection, EntityManager } from 'typeorm';
import { WebhookQueue } from '../db/entities/WebhookQueue';
import { WebhookQueueStatus } from '../lib/models/enums/WebhookQueueStatus';
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
      JSON.stringify(object),
      'Error'
    );

    expect(result.raw.length).toBeTruthy();
  });

  test('when it fails', async () => {
    await expect(
      webhook.insertWebhookQueue(undefined, 'Error')
    ).rejects.toThrow(ModuleException);
  });
});

describe('Test fetching webhook queue by status', () => {
  test('when records are found', async () => {
    await enttityManager.save(WebhookQueue, {
      request: JSON.stringify({ test: 'list' }),
      status: WebhookQueueStatus.FAILED,
      error: 'Something failed',
    });

    const result = await webhook.getWebhookQueue(WebhookQueueStatus.FAILED);

    expect(result.length).toBeTruthy();
  });

  test('when records do not exist', async () => {
    await enttityManager.delete(WebhookQueue, {});

    const result = await webhook.getWebhookQueue(WebhookQueueStatus.FAILED);

    expect(result.length).toBeFalsy();
  });
});
