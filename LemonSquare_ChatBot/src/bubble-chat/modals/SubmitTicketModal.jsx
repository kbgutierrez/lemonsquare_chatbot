import { useState } from "react"

import {
  Ticket,
  X,
  CheckCircle2,
  Flag,
  FolderKanban,
  User,
  FileText,
  SendHorizonal,
} from "lucide-react"

import TicketField from "../components/TicketField"
import TicketTextarea from "../components/TicketTextarea"
import TicketDropdown from "../components/TicketDropdown"

import { useTicketForm } from "../hooks/useTicketForm"

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

const SubmitTicketModal = ({
  onClose,
}) => {

  const [closing, setClosing] =
    useState(false)

  const close = () => {
    setClosing(true)

    setTimeout(onClose, 200)
  }

  const {
    form,
    loading,
    success,
    words,
    update,
    submit,
    MAX_TITLE,
    MAX_WORDS,
  } = useTicketForm(() => {
    setTimeout(close, 1200)
  })

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
      {/* MODAL */}
      <div
        className={`
          relative

          flex
          min-w-0
          w-full
          max-w-[95vw]
          flex-col

          overflow-hidden

          rounded-[28px]

          border
          border-violet-100

          bg-white/95
          backdrop-blur-xl

          shadow-[0_25px_80px_rgba(0,0,0,0.18)]

          transition-all
          duration-300

          sm:max-w-[720px]

          max-h-[92vh]

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

            px-4
            py-4

            sm:px-6
          "
        >
          {/* TITLE */}
          <div className="flex min-w-0 items-center gap-4">
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
              <Ticket className="h-5 w-5 text-violet-700" />
            </div>

            <div className="min-w-0">
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
                  truncate

                  text-lg
                  font-semibold
                  text-slate-900

                  sm:text-xl
                "
              >
                Submit Ticket
              </h2>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap items-center gap-2">
            <TicketDropdown
              icon={Flag}
              value={
                form.PriorityLevel
              }
              items={priorities}
              onChange={(value) =>
                update(
                  "PriorityLevel",
                  value
                )
              }
            />

            <TicketDropdown
              icon={FolderKanban}
              value={
                form.CategoryName
              }
              items={categories}
              onChange={(value) =>
                update(
                  "CategoryName",
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
        <div
          className="
            min-w-0

            overflow-y-auto
            overflow-x-hidden

            px-4
            py-4

            sm:px-6
            sm:py-5

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
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

          {/* SESSION */}
          <div
            className="
              mb-5

              grid
              gap-4

              sm:grid-cols-2
            "
          >
            <TicketField
              label="Requester User ID"
              icon={User}
              value={
                form.RequesterUserID
              }
              disabled
            />

            <TicketField
              label="Session ID"
              icon={FileText}
              value={form.SessionID}
              disabled
            />
          </div>

          {/* TITLE */}
          <div className="mb-5">
            <TicketField
              label="Chat Title"
              value={form.ChatTitle}
              max={MAX_TITLE}
              placeholder="Enter ticket title..."
              onChange={(value) =>
                update(
                  "ChatTitle",
                  value
                )
              }
            />
          </div>

          {/* SUMMARY */}
          <div className="mb-5">
            <TicketField
              label="Issue Summary"
              value={
                form.IssueSummary
              }
              placeholder="Short issue summary..."
              onChange={(value) =>
                update(
                  "IssueSummary",
                  value
                )
              }
            />
          </div>

          {/* DESCRIPTION */}
          <TicketTextarea
            label="Description"
            value={form.Description}
            words={words}
            maxWords={MAX_WORDS}
            placeholder="Describe your issue..."
            onChange={(value) =>
              update(
                "Description",
                value
              )
            }
          />

          {/* FOOTER */}
          <div
            className="
              mt-6

              flex
              flex-col-reverse
              gap-3

              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={close}
              className="
                w-full

                rounded-2xl

                border
                border-slate-200

                bg-white

                px-5
                py-3

                text-sm
                font-medium
                text-slate-700

                transition-colors
                duration-200

                hover:bg-slate-50

                sm:w-auto
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={
                loading ||
                !form.ChatTitle ||
                !form.Description
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2

                rounded-2xl

                bg-gradient-to-r
                from-violet-600
                to-purple-500

                px-6
                py-3

                text-sm
                font-medium
                text-white

                shadow-lg

                transition-all
                duration-200

                hover:scale-[1.02]

                disabled:cursor-not-allowed
                disabled:opacity-50

                sm:w-auto
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