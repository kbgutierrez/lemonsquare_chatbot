// frontends/frontend-bubble/src/bubble-chat/BubbleChat.jsx
import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react"

import {
  AnimatePresence,
  motion,
} from "framer-motion"

import ChatBubble
  from "./components/ChatBubble.jsx"

import ChatWindow
  from "./components/ChatWindow.jsx"

import ChatHistoryModal
  from "./modals/ChatHistoryModal.jsx"

import SubmitTicketModal
  from "./modals/SubmitTicketModal.jsx"

import ThemeModal
  from "./modals/ThemeModal.jsx"

import ResolveConversationModal
  from "./modals/ResolveConversationModal.jsx"

import AboutHelpDeskModal
  from "./modals/AboutHelpDeskModal.jsx"

import {
  ThemeProvider,
  useTheme,
} from "./context/ThemeContext.jsx"

import chatbotService
  from "./services/chatbotService"

import ticketService
  from "./services/ticketService"

import { useBubbleDrag }
  from "./hooks/useBubbleDrag"

import { useChatMessages }
  from "./hooks/useChatMessages"

import { cn }
  from "./utils/cn"

const BubbleChatContent =
  () => {

    const [open, setOpen] =
      useState(false)

    const [activeModal, setActiveModal] =
      useState(null)

    const [userData, setUserData] =
      useState(null)

    const [aiName, setAiName] =
      useState("Cheesecake AI")

    const [historyRefreshKey, setHistoryRefreshKey] =
      useState(0)

    const [isGeneratingDraft, setIsGeneratingDraft] =
      useState(false)

    const [escalationDraft, setEscalationDraft] =
      useState(null)

    const isGeneratingDraftRef =
      useRef(false)

    const messagesRef =
      useRef([])

    const openDraftAutoTriggered =
      useRef(false)

    /* ========================================
       VERIFY USER
    ======================================== */

    useEffect(() => {

      const verify =
        async () => {

          try {

            const data =
              await chatbotService.verifyUserToken()

            if (data.valid) {
              setUserData(data)
            }

          } catch (err) {

            console.error(
              "AUTH_VERIFY_FAILED",
              err
            )
          }
        }

      verify()

    }, [])

    /* ========================================
       LOAD AI SETTINGS
    ======================================== */

    useEffect(() => {

      const loadSettings =
        async () => {

          try {

            const settings =
              await chatbotService.loadAISettings()

            if (
              settings?.AIName
            ) {

              setAiName(
                settings.AIName
              )
            }

          } catch (error) {

            console.error(
              "LOAD_AI_SETTINGS_FAILED",
              error
            )
          }
        }

      loadSettings()

    }, [])

    /* ========================================
       BUBBLE DRAG
    ======================================== */

    const {
      position,
      dragging,
      isLeftSide,
      isTopSide,
      startDrag,
      wasDragged,
      repositionForWindow,
    } = useBubbleDrag()

    /* ========================================
       CHAT STATE
    ======================================== */

    const {
      messages,

      loading,

      isLoadingConversation,

      isResolvingConversation,

      sessionId,

      resolved,

      locked,

      lockReason,

      sendMessage,

      clearConversation,

      restoreConversation,

      resolveConversation,

      resolutionCheck,

      dismissResolution,

      addMessage,

      removeMessage,

      escalationDecision,

      makeEscalationDecision,

      consumedEscalationIds,

      consumeEscalation,

      sessionTicketSubmitted,

      markTicketSubmitted,

    } = useChatMessages()

    const { theme } =
      useTheme()

    /* ========================================
       REFRESH HISTORY
    ======================================== */

    useEffect(() => {

      if (!sessionId) {
        return
      }

      setHistoryRefreshKey(
        p => p + 1
      )

    }, [sessionId])

    /* ========================================
       MESSAGE REF
    ======================================== */

    useEffect(() => {

      messagesRef.current =
        messages

    }, [messages])

    /* ========================================
       REPOSITION WINDOW
    ======================================== */

    useEffect(() => {

      if (!open) {
        return
      }

      repositionForWindow()

    }, [
      open,
      repositionForWindow,
    ])

    /* ========================================
       CLOSE MODAL
    ======================================== */

    const closeModal =
      () => {

        if (
          activeModal === "ticket"
        ) {

          makeEscalationDecision(
            null
          )

          setEscalationDraft(
            null
          )
        }

        setActiveModal(
          null
        )
      }

    /* ========================================
       POINTER EVENTS
    ======================================== */

    const handlePointerDown =
      event => {

        if (open) {
          return
        }

        startDrag(event)
      }

    const handlePointerUp =
      () => {

        if (wasDragged()) {
          return
        }

        if (!open) {

          repositionForWindow()

          requestAnimationFrame(
            () => setOpen(true)
          )

          return
        }

        setOpen(false)
      }

    /* ========================================
       LOAD CONVERSATION
    ======================================== */

    const handleLoadConversation =
      ({
        sessionId,
        resolved = false,
        ticketSubmitted = false,
      }) => {

        restoreConversation({
          sessionId,
          resolved,
          ticketSubmitted,
        })

        repositionForWindow()

        setOpen(true)

        setActiveModal(null)
      }

    /* ========================================
       RESOLVE
    ======================================== */

    const handleResolveConversation =
      async () => {

        try {

          if (
            !sessionId ||
            !messages.length
          ) {
            return
          }

          await resolveConversation()

          setHistoryRefreshKey(
            p => p + 1
          )

          setActiveModal(null)

        } catch (e) {

          console.error(
            "RESOLVE_ERROR",
            e
          )
        }
      }

    /* ========================================
       NEW CHAT
    ======================================== */

    const handleNewChat =
      () => {

        clearConversation()

        repositionForWindow()

        setOpen(true)

        setActiveModal(null)
      }

    /* ========================================
       SUBMIT TICKET
    ======================================== */

    const handleSubmitTicket =
      useCallback(
        async () => {

          if (
            !sessionId ||
            isGeneratingDraftRef.current
          ) {
            return
          }

          isGeneratingDraftRef.current =
            true

          setIsGeneratingDraft(
            true
          )

          makeEscalationDecision(
            "ticket"
          )

          const loadingMsg =
            addMessage(
              "Preparing your ticket draft...",
              "agent",
              false,
              true
            )

          const loadingMsgId =
            loadingMsg.id

          try {

            const response =
              await ticketService.getEscalationDraft(
                sessionId
              )

            if (
              response?.status === "needs_info" &&
              response?.pushback_message
            ) {

              removeMessage(
                loadingMsgId
              )

              addMessage(
                response.pushback_message,
                "agent"
              )

              makeEscalationDecision(
                null
              )

              return
            }

            if (
              response?.status === "success" ||
              response?.summary ||
              response?.description
            ) {

              removeMessage(
                loadingMsgId
              )

              setEscalationDraft(
                response
              )

              setActiveModal(
                "ticket"
              )

              return
            }

            removeMessage(
              loadingMsgId
            )

            addMessage(
              "Unable to prepare ticket draft. Please try again.",
              "agent"
            )

            makeEscalationDecision(
              null
            )

          } catch (e) {

            console.error(
              "SUBMIT_TICKET_ERROR",
              e
            )

            removeMessage(
              loadingMsgId
            )

            addMessage(
              "Unable to generate escalation draft right now. Please try again later.",
              "agent"
            )

            makeEscalationDecision(
              null
            )

          } finally {

            setIsGeneratingDraft(
              false
            )

            isGeneratingDraftRef.current =
              false
          }
        },

        [
          sessionId,
          addMessage,
          removeMessage,
          makeEscalationDecision,
        ]
      )

    /* ========================================
       AUTO OPEN DRAFT
    ======================================== */

    useEffect(() => {

      if (
        resolutionCheck?.resolutionAction ===
          "open_draft" &&
        !openDraftAutoTriggered.current
      ) {

        openDraftAutoTriggered.current =
          true

        handleSubmitTicket()
      }

      if (
        resolutionCheck?.resolutionAction !==
        "open_draft"
      ) {

        openDraftAutoTriggered.current =
          false
      }

    }, [
      resolutionCheck?.resolutionAction,
      handleSubmitTicket,
    ])

    /* ========================================
       OPEN MODAL
    ======================================== */

    const handleOpenModal =
      modalId => {

        if (
          modalId === "new-chat"
        ) {

          handleNewChat()

          return
        }

        if (
          modalId === "ticket"
        ) {

          handleSubmitTicket()

          return
        }

        setActiveModal(
          modalId
        )
      }

    /* ========================================
       REQUESTER ID
    ======================================== */

    let requesterId =
      null

    try {

      requesterId =
        chatbotService.resolveRequesterId(
          chatbotService.getUserToken()
        )

    } catch {

      requesterId =
        null
    }

    /* ========================================
       MODALS
    ======================================== */

    const modals = {

      history: (
        <ChatHistoryModal
          key={historyRefreshKey}
          refreshKey={historyRefreshKey}
          onClose={closeModal}
          onLoadConversation={
            handleLoadConversation
          }
          onClearConversation={
            clearConversation
          }
        />
      ),

      ticket: (
        <SubmitTicketModal
          onClose={closeModal}
          onSubmitted={
            markTicketSubmitted
          }
          sessionId={sessionId}
          requesterId={requesterId}
          userData={userData}
          messages={messages}
          initialDraftData={
            escalationDraft
          }
        />
      ),

      theme: (
        <ThemeModal
          isOpen={true}
          onClose={closeModal}
        />
      ),

      resolve: (
        <ResolveConversationModal
          onClose={closeModal}
          onResolve={
            handleResolveConversation
          }
        />
      ),

      about: (
        <AboutHelpDeskModal
          onClose={closeModal}
        />
      ),
    }

    /* ========================================
       RENDER
    ======================================== */

    return (
      <div
        className={cn(
          "lemonsquare-chat-root",
          "pointer-events-none",
          "flex items-center justify-center"
        )}
      >

        {/* BACKDROP */}
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
              className={cn(
                "pointer-events-none",
                "fixed inset-0",
                "bg-black/[0.05]",
                "  "
              )}
            />
          )}

        </AnimatePresence>

        {/* WINDOW */}
        <div
          data-bubble-drag
          className={cn(
            "pointer-events-auto",
            "fixed",
            "z-[9999]",

            !dragging &&
              "transition-transform duration-300 ease-out"
          )}
          style={{
            left: 0,
            top: 0,
            willChange: "transform",
            touchAction: "none",
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          }}
        >

          <AnimatePresence>

            {open && (
              <motion.div

                initial={{
                  opacity: 0,
                  scale: 0.94,
                  y: 14,
                }}

                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}

                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: 10,
                }}

                transition={{
                  duration: 0.24,
                }}

                className={cn(
                  "absolute z-10",
                  "overflow-hidden",
                  "rounded-[16px]",
                  "bg-black/[0.03]",
                  "ls-border"
                )}

                style={{

                  left:
                    isLeftSide
                      ? 0
                      : "auto",

                  right:
                    !isLeftSide
                      ? 0
                      : "auto",

                  top:
                    isTopSide
                      ? "calc(100% + 12px)"
                      : "auto",

                  bottom:
                    !isTopSide
                      ? "calc(100% + 12px)"
                      : "auto",

                  width:
                    "var(--ls-chat-width, min(96vw, 390px))",

                  height:
                    "var(--ls-chat-height, min(680px, calc(100dvh - 110px)))",

                  backgroundColor:
                    theme.windowWrapperBg,

                  border:
                    "1px solid",

                  borderColor:
                    "var(--ls-border-color)",

                  "--ls-border-color":
                    theme.windowBorder,
                }}
              >

                <ChatWindow
                  aiName={aiName}
                  messages={messages}
                  loading={loading}
                  isLoadingConversation={isLoadingConversation}
                  isResolvingConversation={isResolvingConversation}
                  resolved={resolved}
                  locked={locked}
                  lockReason={lockReason}
                  resolutionCheck={resolutionCheck}
                  onSendMessage={sendMessage}
                  onResolveConversation={handleResolveConversation}
                  onDismissResolution={dismissResolution}
                  onClose={() => setOpen(false)}
                  onOpenModal={handleOpenModal}
                  escalationDecision={escalationDecision}
                  onMakeEscalationDecision={makeEscalationDecision}
                  consumedEscalationIds={consumedEscalationIds}
                  onConsumeEscalation={consumeEscalation}
                  sessionTicketSubmitted={sessionTicketSubmitted}
                />

              </motion.div>
            )}

          </AnimatePresence>

          {/* BUBBLE */}
          <div
            className="
              relative
              z-20
              h-16
              w-16
              select-none
            "

            onPointerDown={
              handlePointerDown
            }

            onPointerUp={
              handlePointerUp
            }
          >
            <ChatBubble
              isOpen={open}
            />
          </div>

        </div>

        {/* MODALS */}
        {activeModal && (
          <div
            className="
              pointer-events-auto
              fixed
              inset-0
              z-[10000]
            "
          >
            {modals[activeModal]}
          </div>
        )}

      </div>
    )
  }

const BubbleChat =
  () => (
    <ThemeProvider>
      <BubbleChatContent />
    </ThemeProvider>
  )

export default BubbleChat