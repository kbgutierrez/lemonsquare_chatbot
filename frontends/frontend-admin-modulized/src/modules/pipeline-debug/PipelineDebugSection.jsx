import { usePipelineDebug } from "./usePipelineDebug.js"
import PipelineControls from "./PipelineControls.jsx"
import PipelineResults from "./PipelineResults.jsx"

const PipelineDebugSection = () => {
  const { text, setText, result, error, loading, activeStage, stages, runPipeline, cancel } = usePipelineDebug()

  return (
    <div className="section-padding space-y-6 max-w-4xl mx-auto">
      <PipelineControls text={text} setText={setText} loading={loading} activeStage={activeStage} stages={stages} onRun={runPipeline} onCancel={cancel} />
      <PipelineResults result={result} error={error} />
    </div>
  )
}

export default PipelineDebugSection
