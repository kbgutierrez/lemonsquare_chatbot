const TicketTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  words,
  maxWords,
}) => {

  const limitReached =
    words >= maxWords

  return (
    <div className="min-w-0 overflow-hidden">

      {/* HEADER */}
      <div className="mb-2 flex items-center justify-between gap-3">

        <label
          className="
            truncate
            text-sm
            font-medium
            text-slate-700
          "
        >
          {label}
        </label>

        <span
          className={`
            shrink-0
            text-xs
            ${
              limitReached
                ? "text-red-500"
                : "text-slate-400"
            }
          `}
        >
          {words}/{maxWords}
        </span>

      </div>

      {/* TEXTAREA */}
      <textarea
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={event =>
          onChange(
            event.target.value
          )
        }
        className="
          block
          min-h-[120px]
          max-h-[220px]
          w-full

          resize-none
          overflow-y-auto
          overflow-x-hidden

          whitespace-pre-wrap
          break-words

          rounded-2xl
          border
          border-violet-200

          bg-violet-50/50

          px-4
          py-3

          text-sm
          leading-relaxed
          text-slate-700

          outline-none

          transition-all
          duration-200

          focus:border-violet-400
          focus:bg-white

          [overflow-wrap:anywhere]
          [word-break:break-word]
          [scrollbar-width:none]

          [&::-webkit-scrollbar]:hidden
        "
      />

    </div>
  )
}

export default TicketTextarea