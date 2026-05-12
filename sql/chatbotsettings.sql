USE [BigEChatBot]
GO

/****** Object:  Table [dbo].[AIChatbot_Settings]    Script Date: 5/8/2026 7:25:54 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[AIChatbot_Settings](
	[SettingID] [int] IDENTITY(1,1) NOT NULL,
	[ActiveModel] [nvarchar](100) NOT NULL,
	[SystemPrompt] [nvarchar](max) NOT NULL,
	[Temperature] [decimal](3, 2) NULL,
	[IsActive] [bit] NULL,
	[CreatedDate] [datetime] NULL,
	[UpdatedBy] [bigint] NULL,
PRIMARY KEY CLUSTERED 
(
	[SettingID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[AIChatbot_Settings] ADD  DEFAULT ('llama-3.3-70b-versatile') FOR [ActiveModel]
GO

ALTER TABLE [dbo].[AIChatbot_Settings] ADD  DEFAULT ((0.3)) FOR [Temperature]
GO

ALTER TABLE [dbo].[AIChatbot_Settings] ADD  DEFAULT ((1)) FOR [IsActive]
GO

ALTER TABLE [dbo].[AIChatbot_Settings] ADD  DEFAULT (getdate()) FOR [CreatedDate]
GO

