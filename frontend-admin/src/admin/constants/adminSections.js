import UploadSection
  from "../components/upload/UploadSection"

import KnowledgeFilesSection
  from "../components/KnowledgeFiles/KnowledgeFilesSection"

import TicketsSection
  from "../components/tickets/TicketsSection"

import ResolvedChatsSection
  from "../components/resolved-chats/ResolvedChatsSection"

import ManualEntriesSection
  from "../components/manual-entries/ManualEntriesSection"

import PipelineDebugSection
  from "../components/pipeline-debug/PipelineDebugSection"

import AISettingsPanel
  from "../components/settings/AISettingsPanel"

export const adminSections = {
  upload:
    UploadSection,

  files:
    KnowledgeFilesSection,

  resolved_chats:
    ResolvedChatsSection,

  manual_entries:
    ManualEntriesSection,

  tickets:
    TicketsSection,

  pipeline_debug:
    PipelineDebugSection,

  ai:
    AISettingsPanel,
}

export default adminSections