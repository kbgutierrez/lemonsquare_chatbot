import {
  BrainCircuit,
} from "lucide-react"

const ModelInfoCard = ({
  model,
}) => {

  if (!model) return null

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
      <div className="flex items-start gap-4">

        {/* ICON */}
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center

            rounded-2xl

            bg-violet-100
          "
        >
          <BrainCircuit
            className="
              h-5
              w-5
              text-violet-700
            "
          />
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
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
                Active AI Model
              </p>

              <h3
                className="
                  mt-1

                  break-words

                  text-lg
                  font-bold

                  text-slate-900
                "
              >
                {model.name}
              </h3>
            </div>

            <div
              className="
                rounded-full

                bg-emerald-100

                px-3
                py-1

                text-xs
                font-semibold

                text-emerald-700
              "
            >
              Active
            </div>
          </div>

          {/* DESCRIPTION */}
          <p
            className="
              mt-3

              text-sm
              leading-relaxed

              text-slate-600
            "
          >
            {
              model.description
            }
          </p>

          {/* EXTRA INFO */}
          <div
            className="
              mt-4

              grid
              gap-3

              sm:grid-cols-2
            "
          >
            <div
              className="
                rounded-2xl

                border
                border-violet-100

                bg-violet-50/50

                p-3
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide

                  text-violet-500
                "
              >
                Model ID
              </p>

              <p
                className="
                  mt-1

                  break-all

                  text-sm
                  font-medium

                  text-slate-800
                "
              >
                {model.id}
              </p>
            </div>

            <div
              className="
                rounded-2xl

                border
                border-violet-100

                bg-violet-50/50

                p-3
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide

                  text-violet-500
                "
              >
                Status
              </p>

              <p
                className="
                  mt-1

                  text-sm
                  font-medium

                  text-emerald-600
                "
              >
                Ready for inference
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelInfoCard