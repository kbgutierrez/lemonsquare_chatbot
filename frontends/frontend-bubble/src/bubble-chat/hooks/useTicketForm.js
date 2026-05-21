import {
  useEffect,
  useMemo,
  useState,
} from "react"

import ticketService from "../services/ticketService"

const MAX_WORDS = 150
const LONGEST_WORD_LIMIT = 189

const DEFAULT_SUMMARY = {
  title: "Support Escalation",

  summary:
    "Conversation escalation requested.",
}

/* ========================================
   HELPERS
======================================== */

const countWords = (
  text = ""
) =>
  (
    text.match(
      /\b\S+\b/g
    ) || []
  ).length

const extractWords = (
  text = ""
) =>
  text.match(
    /\b\S+\b/g
  ) || []

const normalizeSummary = (
  response
) => ({
  title:
    response?.summary ||
    DEFAULT_SUMMARY.title,

  summary:
    response?.description ||
    DEFAULT_SUMMARY.summary,
})

/* ========================================
   HOOK
======================================== */

export const useTicketForm = ({
  sessionId,
  requesterId,
  messages = [],
  onSuccess,
}) => {

  const [loading, setLoading] =
    useState(false)

  const [success, setSuccess] =
    useState(false)

  const [confirming, setConfirming] =
    useState(false)

  const [
    summaryLoading,
    setSummaryLoading,
  ] = useState(true)

  const [summaryError, setSummaryError] =
    useState("")

  const [aiSummary, setAiSummary] =
    useState(DEFAULT_SUMMARY)

  const [form, setForm] =
    useState({
      SessionID:
        sessionId || "",

      RequesterUserID:
        requesterId || "",

      Description: "",
    })

  /* ========================================
     FETCH ESCALATION DRAFT
  ======================================== */

  useEffect(() => {

    let active = true

    const loadDraft =
      async () => {

        if (!sessionId) {
          return
        }

        try {

          setSummaryLoading(true)

          setSummaryError("")

          console.log(
            "LOADING_ESCALATION_DRAFT",
            sessionId
          )

          const response =
            await ticketService.getEscalationDraft(
              sessionId
            )

          console.log(
            "ESCALATION_DRAFT_RESULT",
            response
          )

          if (!active) {
            return
          }

          setAiSummary(
            normalizeSummary(
              response
            )
          )

        } catch (error) {

          console.error(
            "ESCALATION_DRAFT_ERROR",
            error
          )

          if (!active) {
            return
          }

          setSummaryError(
            error?.message ||
              "Failed to generate escalation summary."
          )

          setAiSummary({
            title:
              DEFAULT_SUMMARY.title,

            summary:
              "Unable to generate AI escalation summary.",
          })

        } finally {

          if (active) {
            setSummaryLoading(false)
          }
        }
      }

    loadDraft()

    return () => {
      active = false
    }

  }, [sessionId])

  /* ========================================
     SYNC SESSION
  ======================================== */

  useEffect(() => {

    setForm(previous => ({
      ...previous,

      SessionID:
        sessionId || "",

      RequesterUserID:
        requesterId || "",
    }))

  }, [
    sessionId,
    requesterId,
  ])

  /* ========================================
     WORD COUNT
  ======================================== */

  const words = useMemo(
    () =>
      countWords(
        form.Description
      ),

    [form.Description]
  )

  /* ========================================
     UPDATE
  ======================================== */

  const update = (
    name,
    value
  ) => {

    if (
      name ===
      "Description"
    ) {

      const extracted =
        extractWords(value)

      const exceededWords =
        extracted.length >
        MAX_WORDS

      const exceededWordLength =
        extracted.some(
          word =>
            word.length >
            LONGEST_WORD_LIMIT
        )

      if (
        exceededWords ||
        exceededWordLength
      ) {

        return
      }
    }

    setForm(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  /* ========================================
     CONFIRMATION
  ======================================== */

  const prepareSubmit =
    () => {

      setConfirming(true)
    }

  const cancelConfirmation =
    () => {

      setConfirming(false)
    }

  /* ========================================
     FINAL SUBMIT
  ======================================== */

  const submit =
    async () => {

      try {

        setLoading(true)

        const payload = {
          session_id:
            form.SessionID,

          requester_id:
            Number(
              form.RequesterUserID
            ),

          company_id: 1,

          summary:
            aiSummary.title,

          description:
            aiSummary.summary,
        }

        console.log(
          "ESCALATION_SUBMIT_PAYLOAD",
          payload
        )

        const response =
          await ticketService.submitEscalation(
            payload
          )

        console.log(
          "ESCALATION_SUBMIT_RESPONSE",
          response
        )

        setSuccess(true)

        setTimeout(() => {

          onSuccess?.(
            response
          )

        }, 1000)

      } catch (error) {

        console.error(
          "ESCALATION_SUBMIT_ERROR",
          error
        )

      } finally {

        setLoading(false)
      }
    }

  return {
    form,

    loading,

    success,

    words,

    update,

    submit,

    aiSummary,

    confirming,

    prepareSubmit,

    cancelConfirmation,

    summaryLoading,

    summaryError,

    MAX_WORDS,
  }
}