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
      escalationId: null,
    })

    /* ========================================
       ESCALATION DECISION STATE
       Permanent one-time action recorder.
    ======================================== */

    const [
      escalationDecision,
      setEscalationDecision,
    ] = useState(null)

    /* ========================================
       CONSUMED ESCALATION TRACKING
       Prevents resurrected prompts from rendering.
    ======================================== */

    const [
      consumedEscalationIds,
      setConsumedEscalationIds,
    ] = useState(new Set())

    /* ========================================
       SESSION TICKET SUBMITTED LOCK
       Blocks all escalation UI after successful
       ticket submission in this session.
    ======================================== */

    const [
      sessionTicketSubmitted,
      setSessionTicketSubmitted,
    ] = useState(false)

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
       
       CRITICAL: The assistant's conversational response
       (response.message) is ALWAYS added as a persistent
       chat message. The escalation prompt is a SEPARATE
       transient UI layer rendered by ResolutionPrompt
       using resolutionCheck.resolutionMessage.
       
       Each escalation prompt instance receives a unique
       escalationId. Once consumed, it never renders again.
       sessionTicketSubmitted blocks ALL escalation UI for
       the remainder of the session.
    ======================================== */

    const sendMessage =
      useCallback(
        async text => {

          if (
            resolved ||
            sessionTicketSubmitted
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

          setEscalationDecision(null)

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

            /* ========================================
               ALWAYS add the assistant's conversational
               response as a persistent message.
            ======================================== */

            const aiMessage =
              createMessage({
                sender: "agent",
                text: response?.message?.trim() || "Empty response",
              })

            setMessages([
              ...current,
              userMessage,
              aiMessage,
            ])

            /* ========================================
               Build resolution / escalation state.
               Escalation prompts are ONLY generated here.
               checkResolutionStatus is forbidden from
               creating or resurrecting them.
            ======================================== */

            const hasEscalationFlags =
              Boolean(response?.showResolutionPrompt) ||
              Boolean(response?.allowTicketSubmission)

            if (
              hasEscalationFlags &&
              sessionTicketSubmitted
            ) {

              /* ---- Session already has a submitted ticket.
                 Suppress escalation UI entirely. Backend
                 should return a conversational message.
              ---- */

              setResolutionCheck({
                showResolutionPrompt: false,
                allowTicketSubmission: false,
                conversationStatus: response?.conversationStatus || "active",
                resolutionAction: response?.resolutionAction || "active",
                resolutionMessage: null,
                escalationId: null,
              })

            } else if (
              hasEscalationFlags
            ) {

              /* ---- Generate a unique ID for THIS prompt
                 instance. Old consumed IDs never return.
              ---- */

              const escalationId =
                `esc_${response.sessionId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

              setResolutionCheck({
                showResolutionPrompt: Boolean(response?.showResolutionPrompt),
                allowTicketSubmission: Boolean(response?.allowTicketSubmission),
                conversationStatus: response?.conversationStatus || "active",
                resolutionAction: response?.resolutionAction || "active",
                resolutionMessage: response?.resolutionMessage || response?.message || null,
                escalationId,
              })

            } else {

              setResolutionCheck({
                showResolutionPrompt: false,
                allowTicketSubmission: false,
                conversationStatus: response?.conversationStatus || "active",
                resolutionAction: response?.resolutionAction || "active",
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
        [resolved, state, sessionTicketSubmitted]
      )

    /* ========================================
       RESOLVE CONVERSATION
    ======================================== */

    const resolveConversation =
      useCallback(
        async () => {

          if (
            !state.sessionId ||
            resolved ||
            sessionTicketSubmitted
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
        [resolved, sessionTicketSubmitted, state]
      )

    /* ========================================
       RESOLUTION CHECK
       
       WARNING: This is NOT an escalation prompt source.
       It ONLY updates conversationStatus / resolutionAction
       for auto-behaviors (e.g. open_draft). It must NEVER
       overwrite showResolutionPrompt, allowTicketSubmission,
       resolutionMessage, or escalationId.
    ======================================== */

    const checkResolutionStatus =
      useCallback(
        async () => {

          if (
            !state.sessionId ||
            resolved ||
            sessionTicketSubmitted
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

                /* ---- Explicitly preserve escalation fields.
                   Do NOT let the backend resurrect consumed
                   prompts through this side-channel.
                ---- */
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
        [resolved, sessionTicketSubmitted, state]
      )

    /* ========================================
       RESOLUTION EFFECT
       
       CRITICAL FIX: messages.length removed from deps.
       This stops the automatic resurrection of escalation
       prompts after every new message.
    ======================================== */

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
          escalationId: null,
        })

        return
      }

      checkResolutionStatus()

    }, [
      sessionId,
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
          setEscalationDecision(null)
          setConsumedEscalationIds(new Set())
          setSessionTicketSubmitted(false)

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
          setEscalationDecision(null)
          setConsumedEscalationIds(new Set())
          setSessionTicketSubmitted(false)

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
        (
          decision
        ) => {

          setEscalationDecision(
            decision
          )
        },
        []
      )

    /* ========================================
       CONSUME ESCALATION
       Marks a specific escalation prompt instance
       as permanently handled.
    ======================================== */

    const consumeEscalation =
      useCallback(
        (
          escalationId
        ) => {

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

    /* ========================================
       MARK TICKET SUBMITTED
       Locks escalation UI for the remainder
       of this session and appends a system
       closure message to the conversation.
    ======================================== */

    const markTicketSubmitted =
      useCallback(
        () => {

          setSessionTicketSubmitted(
            true
          )

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