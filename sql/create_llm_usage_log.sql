-- SQL Migration to create tbl_llm_usage_log

CREATE TABLE IF NOT EXISTS tbl_llm_usage_log (
    LogID BIGINT PRIMARY KEY IDENTITY(1,1),
    ModelName NVARCHAR(100) NOT NULL,
    Action NVARCHAR(100),
    TokensPrompt INT DEFAULT 0,
    TokensCompletion INT DEFAULT 0,
    TokensTotal INT DEFAULT 0,
    LatencyMs INT,
    StatusCode INT,
    SessionID NVARCHAR(36),
    Timestamp DATETIME DEFAULT GETUTCDATE(),
    
    -- Rate Limit Tracking
    RemainingRequests INT,
    RemainingTokens INT,
    ResetRequests NVARCHAR(20),
    ResetTokens NVARCHAR(20)
);

CREATE INDEX IX_tbl_llm_usage_log_ModelName ON tbl_llm_usage_log(ModelName);
CREATE INDEX IX_tbl_llm_usage_log_Timestamp ON tbl_llm_usage_log(Timestamp);
CREATE INDEX IX_tbl_llm_usage_log_SessionID ON tbl_llm_usage_log(SessionID);
