import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypes1636410329991 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."account_namespace_enum" AS ENUM('usr', 'eth', 'bet', 'tdl', 'cas')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."external_transaction_originator" AS ENUM('deposit', 'withdraw', 'onramp', 'offramp')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."external_transaction_status" AS ENUM('new', 'processing', 'scheduled', 'completed', 'failed')`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE "public"."account_namespace_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."external_transaction_originator"`
    );
    await queryRunner.query(`DROP TYPE "public"."external_transaction_status"`);
  }
}
