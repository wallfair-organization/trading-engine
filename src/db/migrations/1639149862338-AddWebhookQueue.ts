import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWebhookQueue1639149862338 implements MigrationInterface {
  name = 'AddWebhookQueue1639149862338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "webhook_queue" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "request" jsonb NOT NULL, "status" character varying NOT NULL, "error" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2ad30426734781ed42fad2fd75b" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "webhook_queue"`);
  }
}
