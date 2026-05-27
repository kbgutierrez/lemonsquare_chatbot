import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import chatbotService from "../services/chatbotService"

/* ========================================
   HELPERS
======================================== */

const createMessage = ({
  sender,
  text = "",
  isTyping = false,
  isLoading = false,
}) => ({
  id: crypto.randomUUID(),
  sender,
  text,
  time: isTyping || isLoading
    ? ""
    : new Date().toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
  isTyping,
  isLoading,
})

/* ========================================
   HOOK
======================================== */

export const useChatMessages =
  () => {

    const [messages, setMessages] =
      useState([])

    const [
      isSendingMessage,
      setIsSendingMessage,
    ] = useState(false)

    const [
      isLoadingConversation,
      setIsLoadingConversation,
    ] = useState(false)

    const [
      isResolvingConversation,
      setIsResolvingConversation,
    ] = useState(false)

    const [sessionId, setSessionId] =
      useState(null)

    const [resolved, setResolved] =
      useState(false)

    const [
      resolutionCheck,
      setResolutionCheck,
    ] = useState({
      showResolutionPrompt: false,
      allowTicketSubmission: false,
      conversationStatus: "active",
      resolutionAction: "active",
      resolutionMessage: null,
    })

    const [
      consumedPromptSignature,
      setConsumedPromptSignature,
    ] = useState(null)

    /* ========================================
       REFS
    ======================================== */

    const refs = useRef({
      mounted: true,
      cleared: false,
      requestLocked: false,
      sessionId: null,
      activeLoadId: null,
      messages: [],
    })

    const state =
      refs.current

    /* ========================================
       PROMPT SIGNATURE (for one-time display)
    ======================================== */

    const promptSignature = useMemo(() => {
      return JSON.stringify({
        showResolutionPrompt: resolutionCheck.showResolutionPrompt,
        allowTicketSubmission: resolutionCheck.allowTicketSubmission,
        resolutionAction: resolutionCheck.resolutionAction,
        resolutionMessage: resolutionCheck.resolutionMessage,
      })
    }, [resolutionCheck])

    const consumeResolutionPrompt = useCallback(() => {
      setConsumedPromptSignature(promptSignature)
    }, [promptSignature])

    const isResolutionPromptConsumed =
      consumedPromptSignature === promptSignature

    /* ========================================
       SYNC MESSAGE REF
    ======================================== */

    useEffect(() => {

      state.messages = messages

    }, [messages, state])

    /* ========================================
       MOUNT LIFECYCLE
    ======================================== */

    useEffect(() => {

      state.mounted = true

      return () => {
        state.mounted = false
      }

    }, [state])

    /* ========================================
       RESOLVED STATUS
    ======================================== */

    const syncResolvedStatus =
      useCallback(
        async (
          targetSessionId
        ) => {

          if (
            !targetSessionId
          ) {

            setResolved(false)

            return
          }

          try {

            const sessions =
              await chatbotService.loadUserSessions()

            const matched =
              sessions.find(
                session =>
                  session.id ===
                  targetSessionId
              )

            if (
              !state.mounted
            ) {
              return
            }

            setResolved(
              Boolean(
                matched?.resolved
              )
            )

          } catch (error) {

            console.error(
              "SYNC_RESOLVED_STATUS_ERROR",
              error
            )
          }
        },
        [state]
      )

    /* ========================================
       LOAD CONVERSATION
    ======================================== */

    const loadConversation =
      useCallback(
        async (
          targetSessionId
        ) => {

          if (
            !targetSessionId
          ) {
            return
          }

          if (
            state.cleared
          ) {

            console.log(
              "BLOCKED_AUTO_RESTORE_AFTER_CLEAR"
            )

            return
          }

          const loadId =
            crypto.randomUUID()

          state.activeLoadId =
            loadId

          setIsLoadingConversation(
            true
          )

          try {

            const data =
              await chatbotService.loadSession(
                targetSessionId
              )

            const staleRequest =
              state.activeLoadId !==
              loadId

            if (
              staleRequest ||
              !state.mounted
            ) {

              return
            }

            setMessages(
              Array.isArray(
                data?.messages
              )
                ? data.messages
                : []
            )

            await syncResolvedStatus(
              targetSessionId
            )

          } catch (error) {

            console.error(
              "LOAD_HISTORY_ERROR",
              error
            )

            if (
              !state.mounted
            ) {
              return
            }

            setMessages([])
            setSessionId(null)
            setResolved(false)

            state.sessionId =
              null

          } finally {

            if (
              state.mounted
            ) {

              setIsLoadingConversation(
                false
              )
            }
          }
        },
        [
          state,
          syncResolvedStatus,
        ]
      )

    /* ========================================
       AUTO LOAD
    ======================================== */

    useEffect(() => {

      if (!sessionId) {
        return
      }

      loadConversation(
        sessionId
      )

    }, [
      sessionId,
      loadConversation,
    ])

    /* ========================================
       SEND MESSAGE
    ======================================== */

    const sendMessage =
      useCallback(
        async text => {

          if (
            resolved
          ) {
            return
          }

          const trimmed =
            text?.trim()

          if (
            !trimmed ||
            state.requestLocked
          ) {

            return
          }

          state.requestLocked =
            true

          const current =
            state.messages

          const userMessage =
            createMessage({
              sender: "user",
              text: trimmed,
            })

          const typingMessage =
            createMessage({
              sender: "agent",
              isTyping: true,
            })

          setMessages([
            ...current,
            userMessage,
            typingMessage,
          ])

          setIsSendingMessage(
            true
          )

          try {

            const response =
              await chatbotService.sendMessage(
                {
                  SessionID:
                    state.sessionId,

                  MessageContent:
                    trimmed,
                }
              )

            if (
              response?.sessionId
            ) {

              state.sessionId =
                response.sessionId

              setSessionId(
                response.sessionId
              )
            }

            const aiMessage =
              createMessage({
                sender: "agent",

                text:
                  response?.message?.trim() ||
                  "Empty response",
              })

            setMessages([
              ...current,
              userMessage,
              aiMessage,
            ])

            setResolutionCheck({
              showResolutionPrompt: Boolean(response?.showResolutionPrompt),
              allowTicketSubmission: Boolean(response?.allowTicketSubmission),
              conversationStatus: response?.conversationStatus || "active",
              resolutionAction: response?.resolutionAction || "active",
              resolutionMessage: response?.resolutionMessage || null,
            })

          } catch (error) {

            console.error(
              "SEND_MESSAGE_ERROR",
              error
            )

          } finally {

            setIsSendingMessage(
              false
            )

            state.requestLocked =
              false
          }
        },
        [resolved, state]
      )

    /* ========================================
       RESOLVE CONVERSATION
    ======================================== */

    const resolveConversation =
      useCallback(
        async () => {

          if (
            !state.sessionId ||
            resolved
          ) {

            return
          }

          try {

            setIsResolvingConversation(
              true
            )

            await chatbotService.resolveConversation(
              state.sessionId
            )

            setResolved(true)
            setConsumedPromptSignature(null)

          } catch (error) {

            console.error(
              error
            )

            throw error

          } finally {

            setIsResolvingConversation(
              false
            )
          }
        },
        [resolved, state]
      )

    /* ========================================
       RESOLUTION CHECK
    ======================================== */

    const checkResolutionStatus =
      useCallback(
        async () => {

          if (
            !state.sessionId ||
            resolved
          ) {
            return
          }

          try {

            const data =
              await chatbotService.checkResolution(
                state.sessionId
              )

            if (
              !state.mounted
            ) {
              return
            }

            setResolutionCheck({
              showResolutionPrompt:
                Boolean(data?.show_resolution_prompt),

              allowTicketSubmission:
                Boolean(data?.allow_ticket_submission),

              conversationStatus:
                data?.conversation_status || "active",

              resolutionAction:
                data?.resolution_action || "active",

              resolutionMessage:
                data?.resolution_message || null,
            })

          } catch (error) {

            console.error(
              "RESOLUTION_CHECK_ERROR",
              error
            )
          }
        },
        [resolved, state]
      )

    useEffect(() => {

      if (
        !sessionId ||
        resolved
      ) {

        setResolutionCheck({
          showResolutionPrompt: false,
          allowTicketSubmission: false,
          conversationStatus: "active",
          resolutionAction: "active",
          resolutionMessage: null,
        })

        return
      }

      checkResolutionStatus()

    }, [
      sessionId,
      messages.length,
      resolved,
      checkResolutionStatus,
    ])

    /* ========================================
       RESTORE
    ======================================== */

    const restoreConversation =
      useCallback(
        ({
          sessionId,
        }) => {

          if (
            !sessionId
          ) {
            return
          }

          state.cleared =
            false

          setMessages([])
          setConsumedPromptSignature(null)

          state.sessionId =
            sessionId

          setSessionId(
            sessionId
          )
        },
        [state]
      )

    /* ========================================
       CLEAR
    ======================================== */

    const clearConversation =
      useCallback(
        () => {

          state.activeLoadId =
            null

          state.sessionId =
            null

          state.cleared =
            true

          setMessages([])
          setSessionId(null)
          setResolved(false)
          setConsumedPromptSignature(null)

          console.log(
            "CONVERSATION_CLEARED"
          )
        },
        [state]
      )

    const dismissResolution =
      useCallback(
        () => {
          setResolutionCheck({
            showResolutionPrompt: false,
            allowTicketSubmission: false,
            conversationStatus: "active",
            resolutionAction: "active",
            resolutionMessage: null,
          })
        },
        []
      )

    /* ========================================
       ADD MESSAGE
    ======================================== */

    const addMessage =
      useCallback(
        (
          text,
          sender = "agent",
          isTyping = false,
          isLoading = false
        ) => {

          const message =
            createMessage({
              sender,
              text,
              isTyping,
              isLoading,
            })

          setMessages(
            prev => [
              ...prev,
              message,
            ]
          )

          return message
        },
        []
      )

    const removeMessage =
      useCallback(
        id => {
          setMessages(
            prev => prev.filter(
              message =>
                message.id !== id
            )
          )
        },
        []
      )

    return {
      messages,
      removeMessage,

      loading:
        isSendingMessage,

      isSendingMessage,

      isLoadingConversation,

      isResolvingConversation,

      sessionId,

      resolved,

      sendMessage,

      resolveConversation,

      clearConversation,

      restoreConversation,

      resolutionCheck,

      dismissResolution,

      addMessage,

      consumeResolutionPrompt,

      isResolutionPromptConsumed,
    }
  }