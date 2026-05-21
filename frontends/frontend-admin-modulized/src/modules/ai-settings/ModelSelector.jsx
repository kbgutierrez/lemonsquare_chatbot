const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
]

const ModelSelector = ({ label, description, value, onChange }) => {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-label block mb-1">{label}</label>
        {description && <p className="text-xs text-[#74877f]">{description}</p>}
      </div>
      <select value={value} onChange={e => onChange(e.target.value)} className="input-base appearance-none bg-[#151d1b] cursor-pointer">
        {MODELS.map(m => <option key={m} value={m} className="bg-[#111917]">{m}</option>)}
      </select>
    </div>
  )
}

export default ModelSelector
