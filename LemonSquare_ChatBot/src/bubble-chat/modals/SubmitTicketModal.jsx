import { useMemo, useState } from "react"

import {
  Ticket,
  X,
  ChevronDown,
  SendHorizonal,
  CheckCircle2,
  Flag,
  FolderKanban,
} from "lucide-react"

const MAX_TITLE = 36
const MAX_WORDS = 150
const LONGEST_WORD_LIMIT = 189

const priorities = [
  "Low",
  "Medium",
  "High",
  "Critical",
]

const categories = [
  "General",
  "Technical",
  "Account",
  "Billing",
]

const field = `
  w-full

  rounded-2xl

  border
  border-violet-200

  bg-violet-50/50

  px-4
  py-3

  text-sm
  text-slate-700

  outline-none

  transition-all
  duration-200

  focus:border-violet-400
  focus:bg-white
`

/* MINI DROPDOWN */
const Dropdown = ({
  icon: Icon,
  value,
  items,
  onChange,
}) => {
  const [open, setOpen] =
    useState(false)

  return (
    <div className="relative z-[80]">
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className="
          flex
          items-center
          gap-2

          rounded-2xl

          border
          border-violet-200

          bg-white/80

          px-4
          py-2.5

          text-sm
          font-medium
          text-slate-700

          shadow-sm

          transition-all
          duration-200

          hover:bg-violet-50
        "
      >
        <Icon className="h-4 w-4 text-violet-500" />

        {value}

        <ChevronDown
          className={`
            h-4
            w-4

            transition-transform
            duration-200

            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {/* MENU */}
      <div
        className={`
          absolute
          right-0
          top-[calc(100%+10px)]
          z-[90]

          min-w-[180px]

          overflow-hidden

          rounded-2xl

          border
          border-violet-100

          bg-white

          shadow-[0_20px_40px_rgba(0,0,0,0.12)]

          transition-all
          duration-200

          ${
            open
              ? `
                pointer-events-auto
                translate-y-0
                opacity-100
              `
              : `
                pointer-events-none
                -translate-y-2
                opacity-0
              `
          }
        `}
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              onChange(item)
              setOpen(false)
            }}
            className="
              w-full

              px-4
              py-3

              text-left
              text-sm
              text-slate-700

              transition-colors
              duration-150

              hover:bg-violet-50
            "
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}

const SubmitTicketModal = ({
  onClose,
}) => {
  const [closing, setClosing] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [success, setSuccess] =
    useState(false)

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      priority: "Medium",
      category: "General",
    })

  /* WORD COUNT */
  const words = useMemo(
    () =>
      (
        form.description.match(
          /\b\S+\b/g
        ) || []
      ).length,

    [form.description]
  )

  /* UPDATE */
  const update = (
    name,
    value
  ) => {
    if (
      name === "title" &&
      value.length > MAX_TITLE
    ) {
      return
    }

    if (
      name === "description"
    ) {
      const extracted =
        value.match(
          /\b\S+\b/g
        ) || []

      if (
        extracted.length >
        MAX_WORDS
      ) {
        return
      }

      if (
        extracted.some(
          (word) =>
            word.length >
            LONGEST_WORD_LIMIT
        )
      ) {
        return
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /* CLOSE */
  const close = () => {
    setClosing(true)

    setTimeout(onClose, 200)
  }

  /* SUBMIT */
  const submit = async () => {
    if (
      !form.title ||
      !form.description
    ) {
      return
    }

    setLoading(true)

    console.log(
      "SUBMIT TICKET",
      {
        USER_ID:
          "USER_ID_PLACEHOLDER",

        API:
          "SUBMIT_TICKET_API_PLACEHOLDER",

        form,
      }
    )

    setTimeout(() => {
      setLoading(false)

      setSuccess(true)

      setTimeout(close, 1200)
    }, 1200)
  }

  return (
    <div
      className={`
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-black/30
        backdrop-blur-[6px]

        p-3

        transition-all
        duration-200

        ${
          closing
            ? "opacity-0"
            : "opacity-100"
        }
      `}
    >
      {/* CARD */}
      <div
        className={`
          relative

          w-full
          max-w-[760px]

          overflow-visible

          rounded-[32px]

          border
          border-violet-100

          bg-white/95
          backdrop-blur-xl

          shadow-[0_25px_80px_rgba(0,0,0,0.18)]

          transition-all
          duration-300

          ${
            closing
              ? `
                translate-y-4
                scale-95
                opacity-0
              `
              : `
                translate-y-0
                scale-100
                opacity-100
              `
          }
        `}
      >
        {/* HEADER */}
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4

            border-b
            border-violet-100

            bg-gradient-to-r
            from-violet-50
            to-purple-50

            px-6
            py-5
          "
        >
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center

                rounded-2xl

                bg-violet-100
              "
            >
              <Ticket className="h-5 w-5 text-violet-700" />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-violet-500
                "
              >
                Support Center
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                Submit Ticket
              </h2>
            </div>
          </div>

          {/* RIGHT NAV */}
          <div className="flex items-center gap-3">
            <Dropdown
              icon={Flag}
              value={form.priority}
              items={priorities}
              onChange={(value) =>
                update(
                  "priority",
                  value
                )
              }
            />

            <Dropdown
              icon={FolderKanban}
              value={form.category}
              items={categories}
              onChange={(value) =>
                update(
                  "category",
                  value
                )
              }
            />

            <button
              type="button"
              onClick={close}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center

                rounded-2xl

                border
                border-violet-100

                bg-white

                transition-colors
                duration-200

                hover:bg-violet-50
              "
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="px-6 py-6">
          {/* SUCCESS */}
          {success && (
            <div
              className="
                mb-5

                flex
                items-center
                gap-3

                rounded-2xl

                border
                border-emerald-100

                bg-emerald-50

                p-4
              "
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />

              <p
                className="
                  text-sm
                  font-medium
                  text-emerald-700
                "
              >
                Ticket submitted successfully.
              </p>
            </div>
          )}

          {/* TITLE */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Ticket Title
              </label>

              <span className="text-xs text-slate-400">
                {form.title.length}/{MAX_TITLE}
              </span>
            </div>

            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                update(
                  "title",
                  e.target.value
                )
              }
              placeholder="Enter ticket title..."
              className={field}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>

              <span
                className={`
                  text-xs

                  ${
                    words >= MAX_WORDS
                      ? "text-red-500"
                      : "text-slate-400"
                  }
                `}
              >
                {words}/{MAX_WORDS}
              </span>
            </div>

            <textarea
              rows={6}
              value={form.description}
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe your issue..."
              className={`
                ${field}
                resize-none
              `}
            />
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={close}
              className="
                rounded-2xl

                border
                border-slate-200

                bg-white

                px-5
                py-2.5

                text-sm
                font-medium
                text-slate-700

                transition-colors
                duration-200

                hover:bg-slate-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={
                loading ||
                !form.title ||
                !form.description
              }
              className="
                flex
                items-center
                gap-2

                rounded-2xl

                bg-gradient-to-r
                from-violet-600
                to-purple-500

                px-6
                py-2.5

                text-sm
                font-medium
                text-white

                shadow-lg

                transition-all
                duration-200

                hover:scale-[1.02]

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? (
                <>
                  <div
                    className="
                      h-4
                      w-4

                      animate-spin

                      rounded-full

                      border-2
                      border-white/40
                      border-t-white
                    "
                  />

                  Submitting...
                </>
              ) : (
                <>
                  <SendHorizonal className="h-4 w-4" />

                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmitTicketModal