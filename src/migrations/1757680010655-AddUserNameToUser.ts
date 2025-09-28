import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserNameToUser1757680010655 implements MigrationInterface {
    name = 'AddUserNameToUser1757680010655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

}
