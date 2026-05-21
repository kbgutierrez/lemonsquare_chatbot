const RangeSlider = ({ label, description, value, onChange, min = 0, max = 1, step = 0.01, displayValue, format }) => {
  const handleChange = (e) => {
    const val = step === 1 ? parseInt(e.target.value, 10) : parseFloat(e.target.value)
    onChange(val)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-label block mb-1">{label}</label>
          {description && <p className="text-xs text-[#74877f]">{description}</p>}
        </div>
        <span className="rounded-lg border border-[#2d3b35] bg-[#18211f] px-3 py-1 text-sm font-bold tabular-nums text-[#f5d547]">
          {format ? format(displayValue ?? value) : (displayValue ?? value)}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={handleChange}
        className="w-full accent-[#95c11f] h-2 appearance-none rounded-full bg-[#0b1110] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#95c11f] [&::-webkit-slider-thumb]:cursor-pointer" />
      <div className="flex justify-between text-[10px] text-[#74877f]">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  )
}

export default RangeSlider
