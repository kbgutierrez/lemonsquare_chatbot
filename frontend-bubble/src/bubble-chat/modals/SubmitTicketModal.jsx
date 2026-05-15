import {
  Ticket,
  CheckCircle2,
  Flag,
  FolderKanban,
  User,
  FileText,
  SendHorizonal,
} from "lucide-react"

import ModalShell from "../components/ModalShell.jsx"

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

    setTimeout(() => {

      onClose?.()

    }, 1200)
  })

  return (
    <ModalShell
      onClose={onClose}
      title="Submit Ticket"
      subtitle="Support Center"
      size="lg"
      icon={
        <Ticket
          className="
            h-5
            w-5
          "
        />
      }
      headerActions={
        <>
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
        </>
      }
    >
      <div
        className="
          min-w-0

          px-4
          py-4

          sm:px-6
          sm:py-5
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
            <CheckCircle2
              className="
                h-5
                w-5

                text-emerald-600
              "
            />

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
            onClick={onClose}
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
                <SendHorizonal
                  className="
                    h-4
                    w-4
                  "
                />

                Submit
              </>
            )}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

export default SubmitTicketModal