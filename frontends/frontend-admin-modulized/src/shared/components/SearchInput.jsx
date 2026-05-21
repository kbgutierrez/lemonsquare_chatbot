import { Search, X } from "lucide-react"

const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-4 h-4 w-4 shrink-0 text-[#74877f]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-10 pr-10"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-3 rounded-lg p-1 text-[#74877f] hover:text-white">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
