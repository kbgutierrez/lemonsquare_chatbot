import {
  useMemo,
  useState,
} from "react"

import ticketService from "../services/ticketService"

const MAX_TITLE = 36
const MAX_WORDS = 150
const LONGEST_WORD_LIMIT = 189

export const useTicketForm =
  (onSuccess) => {

    const [loading, setLoading] =
      useState(false)

    const [success, setSuccess] =
      useState(false)

    const [form, setForm] =
      useState({
        SessionID:
          "CHAT_SESSION_PLACEHOLDER",

        RequesterUserID:
          "USER_ID_PLACEHOLDER",

        ChatTitle: "",

        IssueSummary: "",

        Description: "",

        PriorityLevel:
          "Medium",

        CategoryName:
          "General",
      })

    /* WORD COUNT */
    const words = useMemo(
      () =>
        (
          form.Description.match(
            /\b\S+\b/g
          ) || []
        ).length,

      [form.Description]
    )

    /* UPDATE */
    const update = (
      name,
      value
    ) => {

      if (
        name === "ChatTitle" &&
        value.length > MAX_TITLE
      ) {
        return
      }

      if (
        name === "Description"
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

    /* SUBMIT */
    const submit = async () => {

      if (
        !form.ChatTitle ||
        !form.Description
      ) {
        return
      }

      setLoading(true)

      const payload = {
        SessionID:
          form.SessionID,

        RequesterUserID:
          form.RequesterUserID,

        ChatTitle:
          form.ChatTitle,

        IssueSummary:
          form.IssueSummary ||
          form.Description,

        Description:
          form.Description,

        PriorityLevel:
          form.PriorityLevel,

        CategoryName:
          form.CategoryName,
      }

      const response =
        await ticketService.createTicket(
          payload
        )

      console.log(
        "TICKET_RESPONSE",
        response
      )

      setTimeout(() => {

        setLoading(false)

        setSuccess(true)

        onSuccess?.()

      }, 900)
    }

    return {
      form,

      loading,

      success,

      words,

      update,

      submit,

      MAX_TITLE,

      MAX_WORDS,
    }
  }