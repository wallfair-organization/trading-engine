import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendWebhookQueue1639156365469 implements MigrationInterface {
  name = 'ExtendWebhookQueue1639156365469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" ADD "request_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" ADD "request_status" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" ADD "attempts" integer NOT NULL DEFAULT '1'`
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" ADD CONSTRAINT "request_id_status" UNIQUE ("request_id", "request_status")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" DROP CONSTRAINT "request_id_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" DROP COLUMN "attempts"`
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" DROP COLUMN "request_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_queue" DROP COLUMN "request_id"`
    );
  }
}
