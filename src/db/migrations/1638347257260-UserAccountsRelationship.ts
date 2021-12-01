import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAccountsRelationship1638347257260
  implements MigrationInterface
{
  name = 'UserAccountsRelationship1638347257260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_accounts" DROP CONSTRAINT "FK_dd8f575176b6a7730146f525569"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_accounts" DROP CONSTRAINT "FK_6711686e2dc4fcf9c7c83b83735"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd8f575176b6a7730146f52556"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6711686e2dc4fcf9c7c83b8373"`
    );
    await queryRunner.query(`DROP TABLE "user_accounts"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(
      `CREATE TABLE "user_account" ("user_id" character varying NOT NULL, "owner_account" character varying NOT NULL, "account_namespace" character varying NOT NULL, CONSTRAINT "PK_664ec5f1e6cc577a40d33b8ff09" PRIMARY KEY ("user_id", "owner_account", "account_namespace"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_account"`);
    await queryRunner.query(
      `CREATE TABLE "user" ("user_id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_accounts" ("user_id" character varying NOT NULL, "owner_account" character varying NOT NULL, "account_namespace" character varying NOT NULL, "symbol" character varying NOT NULL, CONSTRAINT "PK_779095453f93df79940fa03660f" PRIMARY KEY ("user_id", "owner_account", "account_namespace", "symbol"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6711686e2dc4fcf9c7c83b8373" ON "user_accounts" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd8f575176b6a7730146f52556" ON "user_accounts" ("owner_account", "account_namespace", "symbol") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_accounts" ADD CONSTRAINT "FK_6711686e2dc4fcf9c7c83b83735" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "user_accounts" ADD CONSTRAINT "FK_dd8f575176b6a7730146f525569" FOREIGN KEY ("owner_account", "account_namespace", "symbol") REFERENCES "account"("owner_account","account_namespace","symbol") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
