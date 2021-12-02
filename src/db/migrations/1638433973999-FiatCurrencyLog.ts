import { MigrationInterface, QueryRunner } from 'typeorm';

export class FiatCurrencyLog1638433973999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "external_transaction_log"
        ADD COLUMN fiat_currency varchar(10),
        ADD COLUMN fiat_amount numeric;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "external_transaction_log"
      DROP COLUMN fiat_currency,
      DROP COLUMN fiat_amount;
    `);
  }
}
