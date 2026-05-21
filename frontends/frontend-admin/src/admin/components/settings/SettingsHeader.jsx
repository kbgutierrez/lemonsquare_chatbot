import {
  SlidersHorizontal,
} from "lucide-react"

const SettingsHeader = ({
  activeModel,
}) => {

  return (
    <div
      className="
        rounded-3xl

        border
        border-violet-100

        bg-white

        p-5

        shadow-sm
      "
    >
      <div className="flex items-center gap-4">

        {/* ICON */}
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center

            rounded-2xl

            bg-violet-100
          "
        >
          <SlidersHorizontal
            className="
              h-6
              w-6
              text-violet-700
            "
          />
        </div>

        {/* TEXT */}
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]

              text-violet-500
            "
          >
            AI Configuration
          </p>

          <h2
            className="
              mt-1

              text-xl
              font-bold

              text-slate-900
            "
          >
            Enterprise AI Settings
          </h2>

          <p
            className="
              mt-1

              text-sm

              text-violet-600
            "
          >
            Active Model:
            {" "}

            <span className="font-semibold">
              {activeModel}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsHeader