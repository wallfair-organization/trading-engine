import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetupTimescaleDb1641466881764 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dd8f575_uniq" ON "external_transaction_log" ("created_at", "external_transaction_id")`
    );
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE`
    );
    await queryRunner.query(
      `SELECT create_hypertable('external_transaction_log', 'created_at');`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
