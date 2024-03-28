import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1711367520044 implements MigrationInterface {
  name = 'Migration1711367520044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "HeartbeatManager"."Heartbeat" ("id" character varying(60) NOT NULL, "lastHeartbeat" TIMESTAMP NOT NULL, CONSTRAINT "PK_264c281215f152f227feca5e820" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`CREATE INDEX "IDX_f199a9d98b609bba6d2bad2c64" ON "HeartbeatManager"."Heartbeat" ("lastHeartbeat") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "HeartbeatManager"."IDX_f199a9d98b609bba6d2bad2c64"`);
    await queryRunner.query(`DROP TABLE "HeartbeatManager"."Heartbeat"`);
  }
}
