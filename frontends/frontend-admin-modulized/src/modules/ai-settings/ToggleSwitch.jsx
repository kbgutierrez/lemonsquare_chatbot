import { useState } from "react"

const ToggleSwitch = ({ label, description, checked, onChange }) => {
  const [toggling, setToggling] = useState(false)

  const handleClick = async () => {
    setToggling(true)
    try { await onChange(!checked) } catch (e) { console.error(e) } finally { setToggling(false) }
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label className="text-label block mb-1">{label}</label>
        {description && <p className="text-xs text-[#74877f]">{description}</p>}
      </div>
      <button onClick={handleClick} disabled={toggling}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-all duration-200 ${
          checked ? "border-[#95c11f] bg-[#95c11f]/20" : "border-[#2d3b35] bg-[#18211f]"
        }`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full transition-all duration-200 ${
          checked ? "left-[26px] bg-[#95c11f]" : "left-0.5 bg-[#74877f]"
        }`} />
      </button>
    </div>
  )
}

export default ToggleSwitch
