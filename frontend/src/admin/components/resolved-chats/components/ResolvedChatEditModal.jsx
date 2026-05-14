import {
  useEffect,
  useState,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import {
  X,
  Save,
} from "lucide-react"

import {
  parseResolvedChat,
} from "../utils/parseResolvedChat"

const ResolvedChatEditModal = ({
  open,
  onClose,
  item,
  onSave,
}) => {

  const [form, setForm] =
    useState({
      issue_reported:
        "",

      issue_found:
        "",

      root_cause:
        "",

      work_done:
        "",
    })

  const [saving, setSaving] =
    useState(false)

  useEffect(() => {

    if (!item) return

    const parsed =
      parseResolvedChat(
        item.content
      )

    setForm({
      issue_reported:
        parsed[
          "Issue Reported"
        ] || "",

      issue_found:
        parsed[
          "Issue Found"
        ] || "",

      root_cause:
        parsed[
          "Root Cause"
        ] || "",

      work_done:
        parsed[
          "Work Done"
        ] || "",
    })

  }, [item])

  const handleSave =
    async () => {

      try {

        setSaving(true)

        await onSave(
          item.id,
          form
        )

        onClose()

      } catch (error) {

        console.error(
          "UPDATE_RESOLVED_CHAT_ERROR",
          error
        )

      } finally {

        setSaving(false)
      }
    }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="
            fixed
            inset-0
            z-50

            flex
            items-center
            justify-center

            bg-black/60

            p-4
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            className="
              flex
              max-h-[90vh]
              w-full
              max-w-3xl
              flex-col

              overflow-hidden

              rounded-[32px]

              border
              border-[#2a3a33]

              bg-[#111917]
            "
          >
            {/* HEADER */}
            <div
              className="
                flex
                items-center
                justify-between

                border-b
                border-[#24312c]

                p-6
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  Edit Resolved Chat
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[#8ea59b]
                  "
                >
                  Update AI learned
                  resolution knowledge.
                </p>
              </div>

              <button
                onClick={
                  onClose
                }
                className="
                  rounded-xl
                  p-2

                  text-white

                  transition-all

                  hover:bg-[#1d2724]
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BODY */}
            <div
              className="
                flex-1
                overflow-auto

                space-y-5

                p-6
              "
            >
              <div className="space-y-2">
                <label
                  className="
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  Issue Reported
                </label>

                <textarea
                  rows={3}
                  value={
                    form.issue_reported
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      issue_reported:
                        e.target.value,
                    })
                  }
                  className="
                    w-full

                    rounded-2xl

                    border
                    border-[#2d3b35]

                    bg-[#18211f]

                    px-4
                    py-3

                    text-white

                    outline-none
                  "
                />
              </div>

              <div className="space-y-2">
                <label
                  className="
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  Issue Found
                </label>

                <textarea
                  rows={3}
                  value={
                    form.issue_found
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      issue_found:
                        e.target.value,
                    })
                  }
                  className="
                    w-full

                    rounded-2xl

                    border
                    border-[#2d3b35]

                    bg-[#18211f]

                    px-4
                    py-3

                    text-white

                    outline-none
                  "
                />
              </div>

              <div className="space-y-2">
                <label
                  className="
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  Root Cause
                </label>

                <textarea
                  rows={3}
                  value={
                    form.root_cause
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      root_cause:
                        e.target.value,
                    })
                  }
                  className="
                    w-full

                    rounded-2xl

                    border
                    border-[#2d3b35]

                    bg-[#18211f]

                    px-4
                    py-3

                    text-white

                    outline-none
                  "
                />
              </div>

              <div className="space-y-2">
                <label
                  className="
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  Work Done
                </label>

                <textarea
                  rows={5}
                  value={
                    form.work_done
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      work_done:
                        e.target.value,
                    })
                  }
                  className="
                    w-full

                    rounded-2xl

                    border
                    border-[#2d3b35]

                    bg-[#18211f]

                    px-4
                    py-3

                    text-white

                    outline-none
                  "
                />
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="
                flex
                justify-end

                border-t
                border-[#24312c]

                p-6
              "
            >
              <button
                onClick={
                  handleSave
                }
                disabled={
                  saving
                }
                className="
                  flex
                  items-center
                  gap-2

                  rounded-2xl

                  bg-[#f5d547]

                  px-5
                  py-3

                  font-semibold

                  text-[#111917]

                  transition-all

                  hover:scale-[1.02]
                "
              >
                <Save className="h-4 w-4" />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ResolvedChatEditModal