import {
  Upload,
  FolderOpen,
  BrainCircuit,
  Ticket,
  FileText,
  MessagesSquare,
  Bug,
} from "lucide-react"

export const navigationItems = [
  {
    id: "upload",
    label: "Upload",
    icon: Upload,
  },

  {
    id: "files",
    label: "Knowledge Files",
    icon: FolderOpen,
  },

  {
    id: "resolved_chats",
    label: "Resolved Chats",
    icon: MessagesSquare,
  },

  {
    id: "manual_entries",
    label: "Manual Entries",
    icon: FileText,
  },

  {
    id: "tickets",
    label: "Tickets",
    icon: Ticket,
  },

  {
    id: "pipeline_debug",
    label: "Pipeline Debug",
    icon: Bug,
  },

  {
    id: "ai",
    label: "AI Configuration",
    icon: BrainCircuit,
  },
]

export default navigationItems