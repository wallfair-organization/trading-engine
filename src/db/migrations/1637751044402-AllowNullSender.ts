import {MigrationInterface, QueryRunner} from "typeorm";

export class AllowNullSender1637751044402 implements MigrationInterface {
    name = 'AllowNullSender1637751044402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "sender_account" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "receiver_account" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "receiver_account" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "sender_account" SET NOT NULL`);
    }

}
