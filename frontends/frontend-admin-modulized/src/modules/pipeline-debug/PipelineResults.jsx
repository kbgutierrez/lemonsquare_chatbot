const renderValue = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "N/A"
  }

  if (
    typeof value === "string"
  ) {
    return value
  }

  return JSON.stringify(
    value,
    null,
    2
  )
}

const RetrievalCard = ({
  item,
  index,
}) => {
  return (
    <div className="rounded-2xl border border-[#2a3a33] bg-[#141d1a] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#3a4a43] bg-[#1d2925] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#95c11f]">
              {item.type ||
                "Unknown"}
            </span>

            <span className="text-xs font-medium text-[#74877f]">
              Result #
              {index + 1}
            </span>
          </div>

          <h4 className="text-sm font-semibold text-white">
            {item.source ||
              "Unknown Source"}
          </h4>
        </div>

        <div className="rounded-xl border border-[#26332d] bg-[#111917] px-3 py-2 text-xs text-[#d5dfdb]">
          Score:{" "}
          {typeof item.score ===
          "number"
            ? item.score.toFixed(
                4
              )
            : "N/A"}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-[#26332d] bg-[#111917] p-4">
        <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#d5dfdb]">
          {renderValue(
            item.content
          )}
        </pre>
      </div>
    </div>
  )
}

const PipelineResults = ({
  result,
  error,
}) => {
  if (error) {
    return (
      <div className="card-surface p-5 md:p-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <p className="text-sm font-semibold text-red-400">
            Pipeline Error
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-red-300">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (!result) {
    return null
  }

  const reformulation =
    result.reformulated_query ||
    result.reformulation

  const finalAnswer =
    result.final_answer ||
    result.generation

  const rawResponse =
    result.raw_debug ||
    result.raw_response

  const ticketResults =
    result
      ?.retrieval_results
      ?.tickets || []

  const documentResults =
    result
      ?.retrieval_results
      ?.documents || []

  return (
    <div className="card-surface overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#26332d] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-1">
          <span className="text-label">
            Pipeline Results
          </span>

          <p className="text-sm text-[#74877f]">
            Full processing output
            from each pipeline
            stage.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 p-5 md:p-6">
        {/* Reformulation */}
        {reformulation && (
          <div className="rounded-2xl border border-[#2a3a33] bg-[#18211f] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#74877f]">
                Reformulated Query
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#26332d] bg-[#111917] p-4">
              <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#d5dfdb]">
                {renderValue(
                  reformulation
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Retrieved Tickets */}
        <div className="rounded-2xl border border-[#2a3a33] bg-[#18211f] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#74877f]">
                Retrieved Tickets
              </h3>

              <p className="mt-2 text-sm text-[#9eb0a9]">
                Ticket-like
                retrieval results
                used by the AI.
              </p>
            </div>

            <div className="rounded-xl border border-[#26332d] bg-[#111917] px-3 py-2 text-xs font-semibold text-white">
              {
                ticketResults.length
              }{" "}
              results
            </div>
          </div>

          <div className="space-y-4">
            {ticketResults.length >
            0 ? (
              ticketResults.map(
                (
                  item,
                  index
                ) => (
                  <RetrievalCard
                    key={`ticket-${index}`}
                    item={
                      item
                    }
                    index={
                      index
                    }
                  />
                )
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2a3a33] bg-[#141d1a] p-5 text-sm text-[#74877f]">
                No ticket
                retrieval results.
              </div>
            )}
          </div>
        </div>

        {/* Retrieved Documents */}
        <div className="rounded-2xl border border-[#2a3a33] bg-[#18211f] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#74877f]">
                Retrieved Documents
              </h3>

              <p className="mt-2 text-sm text-[#9eb0a9]">
                Knowledge documents
                used during answer
                generation.
              </p>
            </div>

            <div className="rounded-xl border border-[#26332d] bg-[#111917] px-3 py-2 text-xs font-semibold text-white">
              {
                documentResults.length
              }{" "}
              results
            </div>
          </div>

          <div className="space-y-4">
            {documentResults.length >
            0 ? (
              documentResults.map(
                (
                  item,
                  index
                ) => (
                  <RetrievalCard
                    key={`document-${index}`}
                    item={
                      item
                    }
                    index={
                      index
                    }
                  />
                )
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2a3a33] bg-[#141d1a] p-5 text-sm text-[#74877f]">
                No document
                retrieval results.
              </div>
            )}
          </div>
        </div>

        {/* Final Answer */}
        {finalAnswer && (
          <div className="rounded-2xl border border-[#2a3a33] bg-[#18211f] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#74877f]">
                Final Answer
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#26332d] bg-[#111917] p-4">
              <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#d5dfdb]">
                {renderValue(
                  finalAnswer
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Raw Debug */}
        {rawResponse && (
          <details className="overflow-hidden rounded-2xl border border-[#2a3a33] bg-[#18211f]">
            <summary className="cursor-pointer border-b border-[#26332d] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#74877f] transition-colors hover:bg-[#1f2a27]">
              Full Raw Debug
            </summary>

            <div className="overflow-auto bg-[#111917] p-5">
              <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-[#9eb0a9]">
                {JSON.stringify(
                  rawResponse,
                  null,
                  2
                )}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

export default PipelineResults