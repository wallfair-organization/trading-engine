import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameFiatColumns1639585438224 implements MigrationInterface {
  name = 'RenameFiatColumns1639585438224';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "external_transaction_log" RENAME COLUMN "fiat_currency" TO "input_currency"`
    );
    await queryRunner.query(
      `ALTER TABLE "external_transaction_log" RENAME COLUMN "fiat_amount" TO "input_amount"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "external_transaction_log" RENAME COLUMN "input_currency" TO "fiat_currency"`
    );
    await queryRunner.query(
      `ALTER TABLE "external_transaction_log" RENAME COLUMN "input_amount" TO "fiat_amount"`
    );
  }
}
