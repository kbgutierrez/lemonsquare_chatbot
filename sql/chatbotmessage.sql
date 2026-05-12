USE [BigEChatBot]
GO

/****** Object:  Table [dbo].[ChatMessage]    Script Date: 5/8/2026 7:26:12 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[ChatMessage](
	[MessageID] [bigint] IDENTITY(1,1) NOT NULL,
	[SessionID] [uniqueidentifier] NOT NULL,
	[SenderRole] [nvarchar](10) NOT NULL,
	[MessageContent] [nvarchar](max) NOT NULL,
	[CreatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MessageID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[ChatMessage] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO

ALTER TABLE [dbo].[ChatMessage]  WITH CHECK ADD  CONSTRAINT [FK_ChatMessage_Session] FOREIGN KEY([SessionID])
REFERENCES [dbo].[ChatSession] ([SessionID])
ON DELETE CASCADE
GO

ALTER TABLE [dbo].[ChatMessage] CHECK CONSTRAINT [FK_ChatMessage_Session]
GO

ALTER TABLE [dbo].[ChatMessage]  WITH CHECK ADD CHECK  (([SenderRole]='ai' OR [SenderRole]='user'))
GO

