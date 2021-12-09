import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeToTransactionLog1639058103129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "external_transaction_log"
            ADD COLUMN fee numeric;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "external_transaction_log"
          DROP COLUMN fee;
        `);
  }
}
