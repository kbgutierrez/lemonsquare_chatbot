import {
  useCallback,
  useEffect,
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

  time:
    isTyping || isLoading
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

    const [locked, setLocked] =
      useState(false)

    const [lockReason, setLockReason] =
      useState(null)

    /* ========================================
       PERSISTENT TICKET LOCK
    ======================================== */

    const [
      ticketSubmitted,
      setTicketSubmitted,
    ] = useState(false)

    const [
      resolutionCheck,
      setResolutionCheck,
    ] = useState({
      showResolutionPrompt: false,
      allowTicketSubmission: false,
      conversationStatus: "active",
      resolutionAction: "active",
      resolutionMessage: null,
      escalationId: null,
    })

    const [
      escalationDecision,
      setEscalationDecision,
    ] = useState(null)

    const [
      consumedEscalationIds,
      setConsumedEscalationIds,
    ] = useState(new Set())

    const [
      sessionTicketSubmitted,
      setSessionTicketSubmitted,
    ] = useState(false)

    /* ========================================
       GLOBAL LOCK
    ======================================== */

    const isSessionLocked =
      locked ||
      resolved ||
      ticketSubmitted ||
      sessionTicketSubmitted

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
       SYNC MESSAGE REF
    ======================================== */

    useEffect(() => {

      state.messages =
        messages

    }, [messages, state])

    /* ========================================
       MOUNT
    ======================================== */

    useEffect(() => {

      state.mounted = true

      return () => {

        state.mounted = false
      }

    }, [state])

    /* ========================================
       SESSION STATUS SYNC
    ======================================== */

    const syncResolvedStatus =
      useCallback(
        async (
          targetSessionId
        ) => {

          if (!targetSessionId) {

            setResolved(false)

            setLocked(false)

            setLockReason(null)

            setTicketSubmitted(false)

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

            if (!state.mounted) {
              return
            }

            const normalizedStatus =
              String(
                matched?.status || ""
              ).toLowerCase()

            const resolvedStatus =
              Boolean(
                matched?.resolved
              )

            const escalatedStatus =
              normalizedStatus ===
              "escalated"

            const archivedStatus =
              normalizedStatus ===
              "archived"

            const draftingTicketStatus =
              normalizedStatus ===
              "drafting_ticket"

            const ticketStatus =
              Boolean(
                matched?.ticketSubmitted ||
                matched?.ticket_submitted ||
                draftingTicketStatus
              )

            const shouldLock =
              resolvedStatus ||
              escalatedStatus ||
              archivedStatus ||
              ticketStatus

            setResolved(
              resolvedStatus
            )

            setTicketSubmitted(
              ticketStatus
            )

            setLocked(
              shouldLock
            )

            if (
              escalatedStatus
            ) {

              setLockReason(
                "escalated"
              )

            } else if (
              archivedStatus
            ) {

              setLockReason(
                "archived"
              )

            } else if (
              resolvedStatus
            ) {

              setLockReason(
                "resolved"
              )

            } else if (
              ticketStatus
            ) {

              setLockReason(
                "ticket"
              )

            } else {

              setLockReason(
                null
              )
            }

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

            setLocked(false)

            setLockReason(null)

            setTicketSubmitted(false)

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
            isSessionLocked
          ) {

            console.warn(
              "CHAT_SESSION_LOCKED"
            )

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

          setEscalationDecision(
            null
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

            const hasEscalationFlags =
              Boolean(
                response?.showResolutionPrompt
              ) ||
              Boolean(
                response?.allowTicketSubmission
              )

            if (
              hasEscalationFlags &&
              isSessionLocked
            ) {

              setResolutionCheck({
                showResolutionPrompt: false,
                allowTicketSubmission: false,
                conversationStatus:
                  response?.conversationStatus ||
                  "active",
                resolutionAction:
                  response?.resolutionAction ||
                  "active",
                resolutionMessage: null,
                escalationId: null,
              })

            } else if (
              hasEscalationFlags
            ) {

              const escalationId =
                `esc_${response.sessionId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

              setResolutionCheck({
                showResolutionPrompt:
                  Boolean(
                    response?.showResolutionPrompt
                  ),

                allowTicketSubmission:
                  Boolean(
                    response?.allowTicketSubmission
                  ),

                conversationStatus:
                  response?.conversationStatus ||
                  "active",

                resolutionAction:
                  response?.resolutionAction ||
                  "active",

                resolutionMessage:
                  response?.resolutionMessage ||
                  response?.message ||
                  null,

                escalationId,
              })

            } else {

              setResolutionCheck({
                showResolutionPrompt: false,
                allowTicketSubmission: false,
                conversationStatus:
                  response?.conversationStatus ||
                  "active",
                resolutionAction:
                  response?.resolutionAction ||
                  "active",
                resolutionMessage: null,
                escalationId: null,
              })
            }

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
        [
          isSessionLocked,
          state,
        ]
      )

    /* ========================================
       RESOLVE CONVERSATION
    ======================================== */

    const resolveConversation =
      useCallback(
        async () => {

          if (
            !state.sessionId ||
            isSessionLocked
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

            setLocked(true)

            setLockReason(
              "resolved"
            )

          } catch (error) {

            console.error(
              "RESOLVE_CONVERSATION_ERROR",
              error
            )

            throw error

          } finally {

            setIsResolvingConversation(
              false
            )
          }
        },
        [
          isSessionLocked,
          state,
        ]
      )

    /* ========================================
       CHECK RESOLUTION
    ======================================== */

    const checkResolutionStatus =
      useCallback(
        async () => {

          if (
            !state.sessionId ||
            isSessionLocked
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

            setResolutionCheck(
              prev => ({
                ...prev,

                conversationStatus:
                  data?.conversation_status ||
                  prev?.conversationStatus ||
                  "active",

                resolutionAction:
                  data?.resolution_action ||
                  prev?.resolutionAction ||
                  "active",

                showResolutionPrompt:
                  prev?.showResolutionPrompt ||
                  false,

                allowTicketSubmission:
                  prev?.allowTicketSubmission ||
                  false,

                resolutionMessage:
                  prev?.resolutionMessage ||
                  null,

                escalationId:
                  prev?.escalationId ||
                  null,
              })
            )

          } catch (error) {

            console.error(
              "RESOLUTION_CHECK_ERROR",
              error
            )
          }
        },
        [
          isSessionLocked,
          state,
        ]
      )

    /* ========================================
       EFFECT
    ======================================== */

    useEffect(() => {

      if (
        !sessionId ||
        isSessionLocked
      ) {

        setResolutionCheck({
          showResolutionPrompt: false,
          allowTicketSubmission: false,
          conversationStatus: "active",
          resolutionAction: "active",
          resolutionMessage: null,
          escalationId: null,
        })

        return
      }

      checkResolutionStatus()

    }, [
      sessionId,
      isSessionLocked,
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

          if (!sessionId) {
            return
          }

          state.cleared =
            false

          setMessages([])

          setEscalationDecision(
            null
          )

          setConsumedEscalationIds(
            new Set()
          )

          setSessionTicketSubmitted(
            false
          )

          setResolved(false)

          setLocked(false)

          setLockReason(null)

          setTicketSubmitted(false)

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

          setLocked(false)

          setLockReason(null)

          setTicketSubmitted(false)

          setEscalationDecision(
            null
          )

          setConsumedEscalationIds(
            new Set()
          )

          setSessionTicketSubmitted(
            false
          )

          console.log(
            "CONVERSATION_CLEARED"
          )
        },
        [state]
      )

    /* ========================================
       DISMISS
    ======================================== */

    const dismissResolution =
      useCallback(
        () => {

          setResolutionCheck({
            showResolutionPrompt: false,
            allowTicketSubmission: false,
            conversationStatus: "active",
            resolutionAction: "active",
            resolutionMessage: null,
            escalationId: null,
          })

        },
        []
      )

    /* ========================================
       ESCALATION DECISION
    ======================================== */

    const makeEscalationDecision =
      useCallback(
        decision => {

          setEscalationDecision(
            decision
          )

        },
        []
      )

    /* ========================================
       CONSUME ESCALATION
    ======================================== */

    const consumeEscalation =
      useCallback(
        escalationId => {

          if (
            !escalationId
          ) {
            return
          }

          setConsumedEscalationIds(
            prev => {

              const next =
                new Set(prev)

              next.add(
                escalationId
              )

              return next
            }
          )
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

    /* ========================================
       REMOVE MESSAGE
    ======================================== */

    const removeMessage =
      useCallback(
        id => {

          setMessages(
            prev =>
              prev.filter(
                message =>
                  message.id !== id
              )
          )

        },
        []
      )

    /* ========================================
       TICKET SUBMITTED
    ======================================== */

    const markTicketSubmitted =
      useCallback(
        () => {

          setSessionTicketSubmitted(
            true
          )

          setTicketSubmitted(
            true
          )

          setResolved(
            true
          )

          setLocked(
            true
          )

          setLockReason(
            "ticket"
          )

          setResolutionCheck({
            showResolutionPrompt: false,
            allowTicketSubmission: false,
            conversationStatus: "resolved",
            resolutionAction: "locked",
            resolutionMessage: null,
            escalationId: null,
          })

          addMessage(
            "Ticket submitted successfully. This chat session is now closed.",
            "agent"
          )
        },
        [addMessage]
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

      locked,

      lockReason,

      ticketSubmitted,

      isSessionLocked,

      sendMessage,

      resolveConversation,

      clearConversation,

      restoreConversation,

      resolutionCheck,

      dismissResolution,

      addMessage,

      escalationDecision,

      makeEscalationDecision,

      consumedEscalationIds,

      consumeEscalation,

      sessionTicketSubmitted,

      markTicketSubmitted,
    }
  }