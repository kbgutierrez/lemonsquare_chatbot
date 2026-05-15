import {
  Brain,
  Sparkles,
  Ticket,
  FileText,
} from "lucide-react"

import DebugCard
  from "./DebugCard"

import DropdownCard
  from "./DropdownCard"

import ContextItem
  from "./ContextItem"

const PipelineResults = ({
  result,
}) => {

  const tickets =
    result?.retrieval_results
      ?.tickets || []

  const documents =
    result?.retrieval_results
      ?.documents || []

  return (
    <div
      className="
        flex-1

        space-y-4

        overflow-auto

        pr-1
      "
    >
      {result?.original_query && (
        <DebugCard
          icon={Brain}
          title="Original Query"
          content={
            result.original_query
          }
        />
      )}

      {result?.reformulated_query && (
        <DebugCard
          icon={Sparkles}
          title="Reformulated Query"
          content={
            result.reformulated_query
          }
        />
      )}

      {result?.final_answer && (
        <DebugCard
          icon={Brain}
          title="Final AI Response"
          content={
            result.final_answer
          }
        />
      )}

      {tickets.length > 0 && (
        <DropdownCard
          title={`Used Tickets (${tickets.length})`}
          icon={Ticket}
          color="text-[#95c11f]"
        >
          <div className="space-y-3">
            {tickets.map(
              (
                ticket,
                index
              ) => (
                <ContextItem
                  key={index}
                  title={`Ticket ${index + 1}`}
                  score={
                    ticket.score
                  }
                  content={
                    ticket.content
                  }
                />
              )
            )}
          </div>
        </DropdownCard>
      )}

      {documents.length > 0 && (
        <DropdownCard
          title={`Used Documents (${documents.length})`}
          icon={FileText}
          color="text-[#f5d547]"
        >
          <div className="space-y-3">
            {documents.map(
              (
                doc,
                index
              ) => (
                <ContextItem
                  key={index}
                  title={`Document ${index + 1}`}
                  score={
                    doc.score
                  }
                  content={
                    doc.content
                  }
                />
              )
            )}
          </div>
        </DropdownCard>
      )}

      {result?.raw_debug && (
        <DropdownCard
          title="Raw Debug Data"
          icon={Brain}
          color="text-[#60a5fa]"
        >
          <pre
            className="
              whitespace-pre-wrap
              break-words

              text-xs

              text-[#b6c3bd]
            "
          >
            {JSON.stringify(
              result.raw_debug,
              null,
              2
            )}
          </pre>
        </DropdownCard>
      )}
    </div>
  )
}

export default PipelineResults