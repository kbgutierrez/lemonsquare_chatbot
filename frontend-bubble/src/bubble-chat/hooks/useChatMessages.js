import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import chatbotService from "../services/chatbotService"

export const useChatMessages = () => {

  const [messages, setMessages] = useState([])
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [isResolvingConversation, setIsResolvingConversation] = useState(false)

  const [sessionId, setSessionId] = useState(null)
  const [resolved, setResolved] = useState(false)

  /* ========================================
     🔥 NEW FIX: HARD RESET LOCK
  ======================================== */
  const clearedRef = useRef(false)

  const mountedRef = useRef(true)
  const requestLockRef = useRef(false)
  const sessionIdRef = useRef(null)
  const activeLoadIdRef = useRef(null)
  const messagesRef = useRef([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const getTime = (date = new Date()) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const syncResolvedStatus = useCallback(async (targetSessionId) => {

    if (!targetSessionId) {
      setResolved(false)
      return
    }

    try {
      const sessions = await chatbotService.loadUserSessions()

      const matched = sessions.find(
        (s) => s.id === targetSessionId
      )

      if (!mountedRef.current) return

      setResolved(Boolean(matched?.resolved))

    } catch (error) {
      console.error("SYNC_RESOLVED_STATUS_ERROR", error)
    }
  }, [])

  const loadConversation = useCallback(async (targetSessionId) => {

    if (!targetSessionId) return

    /* 🔥 BLOCK AUTO-RESTORE AFTER CLEAR */
    if (clearedRef.current) {
      console.log("BLOCKED_AUTO_RESTORE_AFTER_CLEAR")
      return
    }

    const loadId = crypto.randomUUID()
    activeLoadIdRef.current = loadId

    setIsLoadingConversation(true)

    try {

      const data = await chatbotService.loadSession(targetSessionId)

      if (activeLoadIdRef.current !== loadId) return
      if (!mountedRef.current) return

      const normalized = Array.isArray(data?.messages)
        ? data.messages
        : []

      setMessages(normalized)

      await syncResolvedStatus(targetSessionId)

    } catch (error) {

      console.error("LOAD_HISTORY_ERROR", error)

      if (mountedRef.current) {
        setMessages([])
        setSessionId(null)
        setResolved(false)
        sessionIdRef.current = null
      }

    } finally {
      if (mountedRef.current) {
        setIsLoadingConversation(false)
      }
    }

  }, [syncResolvedStatus])

  useEffect(() => {

    if (!sessionId) return

    loadConversation(sessionId)

  }, [sessionId, loadConversation])

  const sendMessage = useCallback(async (text) => {

    if (resolved) return

    const trimmed = text?.trim()
    if (!trimmed) return

    if (requestLockRef.current) return
    requestLockRef.current = true

    const current = messagesRef.current

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmed,
      time: getTime(),
    }

    const typingMessage = {
      id: crypto.randomUUID(),
      sender: "agent",
      text: "",
      time: "",
      isTyping: true,
    }

    setMessages([...current, userMessage, typingMessage])

    setIsSendingMessage(true)

    try {

      const response = await chatbotService.sendMessage({
        SessionID: sessionIdRef.current,
        MessageContent: trimmed,
      })

      if (response?.sessionId) {
        sessionIdRef.current = response.sessionId
        setSessionId(response.sessionId)
      }

      const aiMessage = {
        id: crypto.randomUUID(),
        sender: "agent",
        text: response?.message?.trim() || "Empty response",
        time: getTime(),
      }

      setMessages([...current, userMessage, aiMessage])

    } catch (error) {

      console.error("SEND_MESSAGE_ERROR", error)

    } finally {
      setIsSendingMessage(false)
      requestLockRef.current = false
    }

  }, [resolved])

  const resolveConversation = useCallback(async () => {

    if (!sessionIdRef.current) return

    if (resolved) return

    try {

      setIsResolvingConversation(true)

      await chatbotService.resolveConversation(sessionIdRef.current)

      setResolved(true)

    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setIsResolvingConversation(false)
    }

  }, [resolved])

  const restoreConversation = useCallback(({ sessionId }) => {

    if (!sessionId) return

    clearedRef.current = false  // 🔥 allow restore again

    setMessages([])
    sessionIdRef.current = sessionId
    setSessionId(sessionId)

  }, [])

  const clearConversation = useCallback(() => {

    activeLoadIdRef.current = null
    sessionIdRef.current = null

    setMessages([])
    setSessionId(null)
    setResolved(false)

    /* 🔥 CRITICAL FIX */
    clearedRef.current = true

    console.log("CONVERSATION_CLEARED")

  }, [])

  return {
    messages,
    loading: isSendingMessage,
    isSendingMessage,
    isLoadingConversation,
    isResolvingConversation,
    sessionId,
    resolved,
    sendMessage,
    resolveConversation,
    clearConversation,
    restoreConversation,
  }
}