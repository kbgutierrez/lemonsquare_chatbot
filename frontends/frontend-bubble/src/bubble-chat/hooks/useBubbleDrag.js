import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  CHAT_CONFIG,
} from "../constants/chatConfig"

import {
  getCornerSnapPosition,
  getSideSnapPosition,
} from "../utils/snapPosition"

const DRAG_THRESHOLD = 10

export const useBubbleDrag = () => {
  const {
    BUBBLE_SIZE,
    EDGE_PADDING,
  } = CHAT_CONFIG

  /* ========================================
     POSITION REF (source of truth during drag)
     Zero re-renders on move. Only snap updates state.
  ======================================== */

  const positionRef = useRef(null)

  const getDefaultPosition = useCallback(() => ({
    x: window.innerWidth - BUBBLE_SIZE - EDGE_PADDING,
    y: window.innerHeight - BUBBLE_SIZE - EDGE_PADDING,
  }), [BUBBLE_SIZE, EDGE_PADDING])

  // Initialize position ref
  if (positionRef.current === null) {
    positionRef.current = getDefaultPosition()
  }

  /* ========================================
     CLAMP
  ======================================== */

  const clampPosition = useCallback((x, y) => ({
    x: Math.min(
      Math.max(EDGE_PADDING, x),
      window.innerWidth - BUBBLE_SIZE - EDGE_PADDING
    ),
    y: Math.min(
      Math.max(EDGE_PADDING, y),
      window.innerHeight - BUBBLE_SIZE - EDGE_PADDING
    ),
  }), [BUBBLE_SIZE, EDGE_PADDING])

  /* ========================================
     STATE (only for React reactivity — snap/resize)
  ======================================== */

  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState(() => positionRef.current)

  // Sync state back to ref when state changes externally
  useEffect(() => {
    positionRef.current = position
  }, [position])

  /* ========================================
     DRAG STATE REF (stable, no closures)
  ======================================== */

  const dragStateRef = useRef({
    pointerDown: false,
    moved: false,
    pointerId: null,
    startPoint: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    rafId: null,
    pendingX: null,
    pendingY: null,
  })

  /* ========================================
     SIDE DETECTION
  ======================================== */

  const isLeftSide = useMemo(
    () => position.x < window.innerWidth / 2,
    [position.x]
  )

  const isTopSide = useMemo(
    () => position.y < window.innerHeight / 2,
    [position.y]
  )

  /* ========================================
     APPLY POSITION TO DOM (no React state)
  ======================================== */

  const applyPositionToDOM = useCallback((x, y, transition = false) => {
    const el = document.querySelector('[data-bubble-drag]')
    if (!el) return

    if (transition) {
      el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    } else {
      el.style.transition = ''
    }

    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }, [])

  /* ========================================
     STOP DRAG
  ======================================== */

  const stopDrag = useCallback(() => {
    const ds = dragStateRef.current

    if (!ds.pointerDown) return

    ds.pointerDown = false

    // Cancel any pending RAF
    if (ds.rafId) {
      cancelAnimationFrame(ds.rafId)
      ds.rafId = null
    }

    // Release pointer capture if held
    const el = document.querySelector('[data-bubble-drag]')
    if (el && ds.pointerId !== null) {
      try {
        if (el.hasPointerCapture(ds.pointerId)) {
          el.releasePointerCapture(ds.pointerId)
        }
      } catch (e) {
        // Ignore if already released
      }
    }

    // Restore body scroll
    document.body.classList.remove('bubble-drag-active')
    document.body.style.overscrollBehavior = ''
    document.body.style.touchAction = ''

    if (ds.moved) {
      // Snap using CURRENT ref position (not stale closure)
      const snapped = getSideSnapPosition(
        positionRef.current.x,
        positionRef.current.y
      )

      positionRef.current = snapped
      setPosition(snapped)
      applyPositionToDOM(snapped.x, snapped.y, true)

      // Clear transition after animation
      setTimeout(() => {
        const el2 = document.querySelector('[data-bubble-drag]')
        if (el2) el2.style.transition = ''
      }, 300)
    }

    ds.moved = false
    ds.pointerId = null
    setDragging(false)
  }, [applyPositionToDOM])

  /* ========================================
     POINTER MOVE (stable ref, no closure deps)
  ======================================== */

  const handlePointerMove = useCallback((event) => {
    const ds = dragStateRef.current

    if (!ds.pointerDown) return
    if (event.pointerId !== ds.pointerId) return

    // CRITICAL: preventDefault stops browser scroll takeover
    event.preventDefault()

    const dx = event.clientX - ds.startPoint.x
    const dy = event.clientY - ds.startPoint.y

    const exceededThreshold =
      Math.abs(dx) > DRAG_THRESHOLD ||
      Math.abs(dy) > DRAG_THRESHOLD

    // Start drag on threshold
    if (exceededThreshold && !ds.moved) {
      ds.moved = true
      setDragging(true)
    }

    if (!ds.moved) return

    // Calculate new position
    const newX = event.clientX - ds.dragOffset.x
    const newY = event.clientY - ds.dragOffset.y

    const clamped = clampPosition(newX, newY)

    // Debounce via RAF — schedule only one frame at a time
    ds.pendingX = clamped.x
    ds.pendingY = clamped.y

    if (!ds.rafId) {
      ds.rafId = requestAnimationFrame(() => {
        const s = dragStateRef.current
        if (s.pendingX !== null && s.pendingY !== null) {
          positionRef.current = { x: s.pendingX, y: s.pendingY }
          applyPositionToDOM(s.pendingX, s.pendingY, false)
          s.pendingX = null
          s.pendingY = null
        }
        s.rafId = null
      })
    }
  }, [clampPosition, applyPositionToDOM])

  /* ========================================
     HANDLE RESIZE
  ======================================== */

  const handleResize = useCallback(() => {
    const clamped = clampPosition(
      positionRef.current.x,
      positionRef.current.y
    )

    positionRef.current = clamped
    setPosition(clamped)
    applyPositionToDOM(clamped.x, clamped.y, false)
  }, [clampPosition, applyPositionToDOM])

  /* ========================================
     GLOBAL EVENTS (stable handlers, no re-registration)
  ======================================== */

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", stopDrag)
    window.addEventListener("pointercancel", stopDrag)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", stopDrag)
      window.removeEventListener("pointercancel", stopDrag)
      window.removeEventListener("resize", handleResize)
    }
  }, []) // EMPTY DEPS — handlers are stable via refs

  /* ========================================
     START DRAG
  ======================================== */

  const startDrag = useCallback((event) => {
    // Only left mouse button
    if (event.button !== 0 && event.pointerType === 'mouse') return

    const ds = dragStateRef.current

    ds.pointerDown = true
    ds.moved = false
    ds.pointerId = event.pointerId

    ds.startPoint = {
      x: event.clientX,
      y: event.clientY,
    }

    ds.dragOffset = {
      x: event.clientX - positionRef.current.x,
      y: event.clientY - positionRef.current.y,
    }

    // CRITICAL: Capture pointer to prevent browser from stealing it
    // This prevents the ~300ms touchcancel on mobile
    const el = event.currentTarget
    if (el && el.setPointerCapture) {
      try {
        el.setPointerCapture(event.pointerId)
      } catch (e) {
        // Fallback: some browsers may throw, continue without capture
      }
    }

    // CRITICAL: Prevent browser scroll/pan/pull-to-refresh
    // Only during active drag
    document.body.classList.add('bubble-drag-active')
    document.body.style.overscrollBehavior = 'none'
    document.body.style.touchAction = 'none'

    // Remove any lingering transition
    const bubbleEl = document.querySelector('[data-bubble-drag]')
    if (bubbleEl) bubbleEl.style.transition = ''
  }, [])

  /* ========================================
     DRAG CHECK
  ======================================== */

  const wasDragged = useCallback(() => {
    return dragStateRef.current.moved
  }, [])

  /* ========================================
     SNAP TO WINDOW CORNER
  ======================================== */

  const repositionForWindow = useCallback(() => {
    const snapped = getCornerSnapPosition(
      positionRef.current.x,
      positionRef.current.y
    )

    positionRef.current = snapped
    setPosition(snapped)
    applyPositionToDOM(snapped.x, snapped.y, true)
  }, [applyPositionToDOM])

  /* ========================================
     INITIAL POSITION APPLY
  ======================================== */

  useEffect(() => {
    applyPositionToDOM(positionRef.current.x, positionRef.current.y, false)
  }, [applyPositionToDOM])

  return {
    dragging,
    position,
    isLeftSide,
    isTopSide,
    startDrag,
    wasDragged,
    repositionForWindow,
  }
}