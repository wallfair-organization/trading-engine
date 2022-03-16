import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOriginatorToWebhookQueue1647427433935
  implements MigrationInterface
{
  name = 'AddOriginatorToWebhookQueue1647427433935';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" ADD "originator" character varying NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" DROP COLUMN "originator"`
    );
  }
}
