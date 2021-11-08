import { MigrationInterface, QueryRunner } from 'typeorm';

export class TestMigration1636377810462 implements MigrationInterface {
  name = 'TestMigration1636377810462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "test" ("id" integer NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "testColumn" character varying NOT NULL, CONSTRAINT "PK_5417af0062cf987495b611b59c7" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "test"`);
  }
}
