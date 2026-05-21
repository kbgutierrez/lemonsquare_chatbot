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

  const stages = []

  if (result.reformulation) {
    stages.push({
      label: "Reformulation",
      value: result.reformulation,
    })
  }

  if (result.query_embedding_preview) {
    stages.push({
      label: "Embedding Preview",
      value:
        result.query_embedding_preview,
    })
  }

  if (result.retrieval?.context) {
    stages.push({
      label: "Retrieval Context",
      value: result.retrieval.context,
    })
  }

  if (result.generation) {
    stages.push({
      label: "Generation",
      value: result.generation,
    })
  }

  return (
    <div className="card-surface overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#26332d] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-1">
          <span className="text-label">
            Pipeline Results
          </span>

          <p className="text-sm text-[#74877f]">
            Full processing output from each
            pipeline stage.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-5 p-5 md:p-6">
        {stages.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#2a3a33] bg-[#18211f] p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#74877f]">
                {label}
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#26332d] bg-[#111917] p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#d5dfdb]">
                {value}
              </p>
            </div>
          </div>
        ))}

        {result.raw_response && (
          <details className="overflow-hidden rounded-2xl border border-[#2a3a33] bg-[#18211f]">
            <summary className="cursor-pointer border-b border-[#26332d] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#74877f] transition-colors hover:bg-[#1f2a27]">
              Full Raw Response
            </summary>

            <div className="overflow-auto bg-[#111917] p-5">
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-[#9eb0a9]">
                {JSON.stringify(
                  result.raw_response,
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