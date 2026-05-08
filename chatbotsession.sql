USE [BigEChatBot]
GO

/****** Object:  Table [dbo].[ChatSession]    Script Date: 5/8/2026 7:26:37 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ChatSession](
	[SessionID] [uniqueidentifier] NOT NULL,
	[RequesterUserID] [bigint] NOT NULL,
	[ChatTitle] [nvarchar](255) NULL,
	[StartTime] [datetime] NULL,
	[LastActive] [datetime] NULL,
	[IsActive] [bit] NULL,
	[RelatedTicketID] [bigint] NULL,
	[IssueSummary] [nvarchar](max) NULL,
	[ResolutionSummary] [nvarchar](max) NULL,
	[SessionStatus] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[SessionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[ChatSession] ADD  DEFAULT (newid()) FOR [SessionID]
GO

ALTER TABLE [dbo].[ChatSession] ADD  DEFAULT (getdate()) FOR [StartTime]
GO

ALTER TABLE [dbo].[ChatSession] ADD  DEFAULT (getdate()) FOR [LastActive]
GO

ALTER TABLE [dbo].[ChatSession] ADD  DEFAULT ((1)) FOR [IsActive]
GO

ALTER TABLE [dbo].[ChatSession] ADD  DEFAULT ('Active') FOR [SessionStatus]
GO

