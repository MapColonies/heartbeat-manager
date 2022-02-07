SET SCHEMA 'public'; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT
CREATE TABLE "Heartbeat"
(
    "id" character varying(60) COLLATE pg_catalog."default" NOT NULL,
    "lastHeartbeat" timestamp without time zone NOT NULL,
    CONSTRAINT "PK_Heartbeat_id" PRIMARY KEY (id)
);

CREATE INDEX "IDX_Heartbeat_lastHeartbeat"
    ON "Heartbeat" USING btree
    ("lastHeartbeat" ASC NULLS LAST);
