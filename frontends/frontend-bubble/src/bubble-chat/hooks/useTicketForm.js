import {
  useEffect,
  useMemo,
  useState,
} from "react"

import ticketService from "../services/ticketService"
import chatbotService from "../services/chatbotService"

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
   IMAGE VALIDATION
======================================== */

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

/* ========================================
   HOOK
======================================== */

export const useTicketForm = ({
  sessionId,
  requesterId,
  userData,
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

  const [taxonomy, setTaxonomy] =
    useState([])

  const [form, setForm] =
    useState({
      session_id:
        sessionId || "",

      requester_id:
        requesterId || "",

      company_id:
        userData?.company_id || "",

      summary: "",
      description: "",
      department_id: "",
      subcategory_id: "",
      location: "",
      equipment: "",
    })

  /* ========================================
     IMAGE ATTACHMENT STATE
  ======================================== */

  const [imageFile, setImageFile] =
    useState(null)

  const [imagePreview, setImagePreview] =
    useState(null)

  const [imageError, setImageError] =
    useState(null)

  /* ========================================
     CLEANUP OBJECT URL ON UNMOUNT / CHANGE
  ======================================== */

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  /* ========================================
     FETCH TAXONOMY
  ======================================== */

  useEffect(() => {

    const loadTaxonomy =
      async () => {

        try {

          const data =
            await ticketService.getTaxonomy()

          setTaxonomy(data)

        } catch (error) {

          console.error(
            "TAXONOMY_FETCH_ERROR",
            error
          )
        }
      }

    loadTaxonomy()

  }, [])

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

          // Check if the AI rejected due to missing info
          if (
            response?.status ===
            "needs_info"
          ) {

            console.log(
              "DRAFT_REJECTED_MISSING_INFO",
              response.pushback_message
            )

            // Show the pushback message as an error
            setSummaryError(
              response.pushback_message ||
              "Missing information. Please provide more details in the chat."
            )

            setAiSummary({
              title:
                "Unable to process escalation",

              summary:
                response.pushback_message ||
                "Missing required information.",
            })

            setForm(prev => ({
              ...prev,
              summary: "",
              description: "",
              location: "",
              equipment: "",
            }))

            return
          }

          const normalized =
            normalizeSummary(
              response
            )

          setAiSummary(
            normalized
          )

          setForm(prev => ({
            ...prev,
            summary: normalized.title,
            description: normalized.summary,
            department_id: response?.department_id || "",
            subcategory_id: response?.subcategory_id || "",
            location: response?.location || "",
            equipment: response?.equipment || "",
          }))

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

      session_id:
        sessionId || "",

      requester_id:
        requesterId || "",

      company_id:
        userData?.company_id || "",
    }))

  }, [
    sessionId,
    requesterId,
    userData,
  ])

  /* ========================================
     WORD COUNT
  ======================================== */

  const words = useMemo(
    () =>
      countWords(
        form.description
      ),

    [form.description]
  )

  /* ========================================
     UPDATE
  ======================================== */

  const update = (
    name,
    value
  ) => {

    /* ---- IMAGE ATTACHMENT HANDLER ---- */
    if (name === "image") {
      if (value === null) {
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview)
        }
        setImageFile(null)
        setImagePreview(null)
        setImageError(null)
        return
      }

      if (!ALLOWED_IMAGE_TYPES.includes(value.type)) {
        setImageError("Only PNG, JPG, JPEG, WEBP, and GIF images are allowed.")
        return
      }

      if (value.size > MAX_IMAGE_SIZE) {
        setImageError("Image must be smaller than 5 MB.")
        return
      }

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setImageFile(value)
      setImagePreview(URL.createObjectURL(value))
      setImageError(null)
      return
    }

    if (
      name ===
      "description"
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
            form.session_id,

          requester_id:
            Number(
              form.requester_id
            ),

          company_id:
            Number(
              form.company_id || 1
            ),

          summary:
            form.summary,

          description:
            form.description,

          department_id:
            Number(form.department_id),

          subcategory_id:
            Number(form.subcategory_id),

          location:
            form.location,

          equipment:
            form.equipment,

          user_token:
            chatbotService.getUserToken?.() ||
            localStorage.getItem("user_token"),

          image:
            imageFile,
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

    taxonomy,

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

    imageFile,

    imagePreview,

    imageError,
  }
}