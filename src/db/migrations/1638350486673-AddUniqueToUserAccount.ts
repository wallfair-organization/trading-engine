import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueToUserAccount1638350486673 implements MigrationInterface {
  name = 'AddUniqueToUserAccount1638350486673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_account" ADD CONSTRAINT "owner_namespace" UNIQUE ("owner_account", "account_namespace")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_account" DROP CONSTRAINT "owner_namespace"`
    );
  }
}
