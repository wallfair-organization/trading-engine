import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1636411493071 implements MigrationInterface {
    name = 'Initial1636411493071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_account" ("user_id" uuid NOT NULL, "owner_account" character varying NOT NULL, "account_namespace" "public"."account_namespace_enum" NOT NULL, "symbol" character varying NOT NULL, CONSTRAINT "PK_1e7af5387f4169347ddef6e8180" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("owner_account" character varying NOT NULL, "account_namespace" "public"."account_namespace_enum" NOT NULL, "symbol" character varying NOT NULL, "balance" numeric(18,0) NOT NULL, CONSTRAINT "PK_8ec3dedb1ee17a8630a7c57b0f9" PRIMARY KEY ("owner_account", "account_namespace", "symbol"))`);
        await queryRunner.query(`CREATE TABLE "external_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originator" "public"."external_transaction_originator" NOT NULL, "external_system" character varying NOT NULL, "status" "public"."external_transaction_status" NOT NULL, "external_transaction_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_169d396061ffd3ef349913de2c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c8e032f5ff9f890a40d328e786" ON "external_transaction" ("originator") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba9bb43e3abb89b309aac3c049" ON "external_transaction" ("status") `);
        await queryRunner.query(`CREATE TABLE "external_transaction_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originator" "public"."external_transaction_originator" NOT NULL, "external_system" character varying NOT NULL, "status" "public"."external_transaction_status" NOT NULL, "external_transaction_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4c7a4215e0b2ab2bde95a26453f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b3c923ef097e83ba8125313d14" ON "external_transaction_log" ("originator") `);
        await queryRunner.query(`CREATE INDEX "IDX_e43071abfa39fdaaf7164ef121" ON "external_transaction_log" ("status") `);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sender_namespace" "public"."account_namespace_enum" NOT NULL, "sender_account" character varying NOT NULL, "receiver_namespace" "public"."account_namespace_enum" NOT NULL, "receiver_account" character varying NOT NULL, "symbol" character varying NOT NULL, "amount" numeric(18,0) NOT NULL, "executed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "sender_account_idx" ON "transaction" ("sender_account") `);
        await queryRunner.query(`CREATE INDEX "receiver_account_idx" ON "transaction" ("receiver_account") `);
        await queryRunner.query(`ALTER TABLE "user_account" ADD CONSTRAINT "FK_07b1f76609d3e524be765a89bdd" FOREIGN KEY ("owner_account", "account_namespace", "symbol") REFERENCES "account"("owner_account","account_namespace","symbol") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_account" DROP CONSTRAINT "FK_07b1f76609d3e524be765a89bdd"`);
        await queryRunner.query(`DROP INDEX "public"."receiver_account_idx"`);
        await queryRunner.query(`DROP INDEX "public"."sender_account_idx"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e43071abfa39fdaaf7164ef121"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b3c923ef097e83ba8125313d14"`);
        await queryRunner.query(`DROP TABLE "external_transaction_log"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba9bb43e3abb89b309aac3c049"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c8e032f5ff9f890a40d328e786"`);
        await queryRunner.query(`DROP TABLE "external_transaction"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "user_account"`);
    }

}
