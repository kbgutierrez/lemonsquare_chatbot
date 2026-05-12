USE [BigEHelpDeskDev]
GO

/****** Object:  Table [dbo].[tbl_ticket_evaluation]    Script Date: 5/8/2026 7:27:14 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[tbl_ticket_evaluation](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[ticket_number] [varchar](15) NULL,
	[issue_reported] [nvarchar](max) NULL,
	[issue_found] [nvarchar](max) NULL,
	[issue_cause] [nvarchar](max) NULL,
	[work_done] [nvarchar](max) NULL,
	[advanced_work_done] [nvarchar](max) NULL,
	[remarks] [nvarchar](max) NULL,
	[attachment] [nvarchar](300) NULL,
	[resolved_by] [int] NULL,
	[resolved_date] [datetime] NULL,
	[updated_by] [int] NULL,
	[updated_date] [datetime] NULL,
	[add_to_lms] [varchar](15) NULL,
 CONSTRAINT [PK_tbl_ticket_evaluation] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE [dbo].[tbl_ticket_evaluation] ADD  CONSTRAINT [DF_tbl_ticket_evaluation_resolved_date]  DEFAULT (getdate()) FOR [resolved_date]
GO

ALTER TABLE [dbo].[tbl_ticket_evaluation] ADD  CONSTRAINT [DF_tbl_ticket_evaluation_add_to_lms]  DEFAULT ('PENDING') FOR [add_to_lms]
GO

