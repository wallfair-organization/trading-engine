import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionQueue1636666835016 implements MigrationInterface {
  name = 'AddTransactionQueue1636666835016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."network_code" AS ENUM('ETH', 'MATIC')`
    );
    await queryRunner.query(
      `CREATE TABLE "transaction_queue" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "network_code" "public"."network_code" NOT NULL, "receiver" character varying NOT NULL, "amount" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "externalTransactionId" uuid, CONSTRAINT "REL_2e04dde8bf8c8e75df059196cb" UNIQUE ("externalTransactionId"), CONSTRAINT "PK_ab1d574dc95be0e4aa761888c54" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2803aa8bc828ab88576a5df7b5" ON "transaction_queue" ("receiver") `
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_queue" ADD CONSTRAINT "FK_2e04dde8bf8c8e75df059196cb8" FOREIGN KEY ("externalTransactionId") REFERENCES "external_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction_queue" DROP CONSTRAINT "FK_2e04dde8bf8c8e75df059196cb8"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2803aa8bc828ab88576a5df7b5"`
    );
    await queryRunner.query(`DROP TABLE "transaction_queue"`);
    await queryRunner.query(`DROP TYPE "public"."network_code"`);
  }
}
