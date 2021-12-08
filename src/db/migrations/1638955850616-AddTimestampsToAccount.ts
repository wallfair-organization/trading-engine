import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToAccount1638955850616 implements MigrationInterface {
  name = 'AddTimestampsToAccount1638955850616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "account" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "created_at"`);
  }
}
