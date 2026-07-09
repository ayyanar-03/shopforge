import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783590470783 implements MigrationInterface {
    name = 'Migration1783590470783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."return_requests_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "return_requests" ("id" SERIAL NOT NULL, "orderId" integer NOT NULL, "userId" integer NOT NULL, "reason" character varying NOT NULL, "details" character varying, "status" "public"."return_requests_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_38714de8942bd9bc3a450a06889" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_returnrequest_user" ON "return_requests" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_returnrequest_order" ON "return_requests" ("orderId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_returnrequest_order"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_returnrequest_user"`);
        await queryRunner.query(`DROP TABLE "return_requests"`);
        await queryRunner.query(`DROP TYPE "public"."return_requests_status_enum"`);
    }

}
