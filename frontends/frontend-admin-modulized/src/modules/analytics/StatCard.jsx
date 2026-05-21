const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accentColor,
}) => {
  const colorClass =
    accentColor === "green"
      ? "text-[#95c11f]"
      : accentColor === "yellow"
      ? "text-[#f5d547]"
      : "text-[#c7d3ce]"

  const bgClass =
    accentColor === "green"
      ? "bg-[#95c11f]/10"
      : accentColor === "yellow"
      ? "bg-[#f5d547]/10"
      : "bg-[#18211f]"

  const borderClass =
    accentColor === "green"
      ? "border-[#95c11f]/20"
      : accentColor === "yellow"
      ? "border-[#f5d547]/20"
      : "border-[#2b3933]"

  return (
    <div
      className={`group flex min-h-[165px] flex-col justify-between rounded-3xl border ${borderClass} ${bgClass} p-5 transition-all duration-200 hover:-translate-y-[2px] hover:border-[#f5d547]/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.22)] md:p-6`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="text-label block truncate">
            {label}
          </span>
        </div>

        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.04] bg-black/10 transition-all duration-200 group-hover:scale-105 ${colorClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-end">
        <p className="stat-value leading-none">
          {value}
        </p>

        {sub && (
          <p className="mt-3 text-sm leading-relaxed text-[#74877f]">
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

export default StatCard