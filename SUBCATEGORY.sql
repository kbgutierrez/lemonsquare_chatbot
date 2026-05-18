USE [BigEHelpDeskDev]
GO

/****** Object:  Table [dbo].[tbl_subcategory]    Script Date: 5/15/2026 2:34:48 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[tbl_subcategory](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[department_id] [int] NULL,
	[category_id] [bigint] NULL,
	[sub_category] [nvarchar](50) NULL,
	[created_by] [int] NULL,
	[created_date] [datetime] NULL,
	[updated_by] [int] NULL,
	[updated_date] [datetime] NULL,
	[is_active] [int] NULL,
 CONSTRAINT [PK_tbl_subcategory] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[tbl_subcategory] ADD  CONSTRAINT [DF_tbl_subcategory_created_date]  DEFAULT (getdate()) FOR [created_date]
GO

ALTER TABLE [dbo].[tbl_subcategory] ADD  CONSTRAINT [DF_tbl_subcategory_is_active]  DEFAULT ((1)) FOR [is_active]
GO

