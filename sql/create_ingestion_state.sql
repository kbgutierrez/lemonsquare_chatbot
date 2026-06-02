-- ==========================================================
-- Create Table: tbl_ingestion_sync_state
-- Purpose: Track RAG ingestion state for distributed workers.
-- ==========================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tbl_ingestion_sync_state]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[tbl_ingestion_sync_state] (
        [EntityKey]    VARCHAR(256) NOT NULL,
        [EntityType]   VARCHAR(50)  NOT NULL,
        [ContentHash]  CHAR(64)     NOT NULL,
        [LastSyncedAt] DATETIME     CONSTRAINT [DF_ingestion_sync_state_LastSyncedAt] DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_tbl_ingestion_sync_state] PRIMARY KEY CLUSTERED ([EntityKey] ASC)
    );

    CREATE INDEX [IX_ingestion_sync_state_EntityType] ON [dbo].[tbl_ingestion_sync_state]([EntityType]);
    
    PRINT 'Table tbl_ingestion_sync_state created successfully.';
END
ELSE
BEGIN
    PRINT 'Table tbl_ingestion_sync_state already exists.';
END
GO
