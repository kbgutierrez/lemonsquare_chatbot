import { useState } from "react"

import {
  mockMessages,
} from "../data/mockMessages"

/*
  SQL READY STRUCTURE

  ChatSession
  - RequesterUserID
  - ChatTitle
  - StartTime
  - LastActive
  - IsActive
  - RelatedTicketID
  - IssueSummary
  - ResolutionSummary
  - SessionStatus
*/

export const useChatMessages =
  () => {

    /* SESSION */
    const [chatSession] =
      useState({
        ChatSessionID:
          "CHAT_SESSION_PLACEHOLDER",

        RequesterUserID:
          "USER_ID_PLACEHOLDER",

        ChatTitle:
          "New Conversation",

        StartTime:
          new Date().toISOString(),

        LastActive:
          new Date().toISOString(),

        IsActive: true,

        RelatedTicketID:
          null,

        IssueSummary:
          null,

        ResolutionSummary:
          null,

        SessionStatus:
          "active",
      })

    /* MESSAGES */
    const [messages, setMessages] =
      useState(mockMessages)

    /* TIME */
    const getTime = () =>
      new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )

    /*
      SEND MESSAGE

      FUTURE SAFE:
      - OpenAI/Groq
      - SQL insert
      - websocket
      - streaming
      - RAG pipeline
      - analytics
    */

    const sendMessage = (
      message_text,
      isAgent = false
    ) => {

      const message = {
        MessageID:
          Date.now().toString(),

        ChatSessionID:
          chatSession.ChatSessionID,

        SenderType:
          isAgent
            ? "agent"
            : "user",

        MessageText:
          message_text,

        CreatedAt:
          new Date().toISOString(),

        /* UI COMPAT */
        id:
          Date.now().toString(),

        sender:
          isAgent
            ? "agent"
            : "user",

        text:
          message_text,

        time: getTime(),
      }

      console.log(
        "CHAT_MESSAGE_PAYLOAD",
        message
      )

      setMessages((prev) => [
        ...prev,
        message,
      ])
    }

    /*
      LOAD CONVERSATION

      FUTURE:
      API -> SQL -> mapper
    */

    const loadConversation = (
      conversationMessages
    ) => {

      const loaded =
        conversationMessages.map(
          (
            message,
            index
          ) => ({
            MessageID:
              `loaded-${index}`,

            ChatSessionID:
              chatSession.ChatSessionID,

            SenderType:
              message.sender,

            MessageText:
              message.text,

            CreatedAt:
              new Date().toISOString(),

            /* UI COMPAT */
            id:
              `loaded-${index}`,

            sender:
              message.sender,

            text:
              message.text,

            time: getTime(),
          })
        )

      setMessages(loaded)
    }

    /*
      CLEAR CONVERSATION

      FUTURE:
      SQL update
      archive
      soft delete
    */

    const clearConversation =
      () => {

        setMessages([])
      }

    return {
      /* SQL READY */
      chatSession,

      /* UI */
      messages,

      /* ACTIONS */
      sendMessage,

      loadConversation,

      clearConversation,
    }
  }