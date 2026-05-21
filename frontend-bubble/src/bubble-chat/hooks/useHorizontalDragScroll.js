import {
  useEffect,
  useRef,
} from "react"

const DRAG_THRESHOLD = 5

const useHorizontalDragScroll =
  () => {

    const scrollRef =
      useRef(null)

    const dragState =
      useRef({
        isDragging: false,
        hasDragged: false,
        startX: 0,
        scrollLeft: 0,
      })

    useEffect(() => {

      const container =
        scrollRef.current

      if (!container) {
        return
      }

      const state =
        dragState.current

      /* ========================================
         POINTER DOWN
      ======================================== */

      const handlePointerDown =
        (event) => {

          state.isDragging =
            true

          state.hasDragged =
            false

          state.startX =
            event.clientX

          state.scrollLeft =
            container.scrollLeft

          container.style.cursor =
            "grabbing"
        }

      /* ========================================
         POINTER MOVE
      ======================================== */

      const handlePointerMove =
        (event) => {

          if (
            !state.isDragging
          ) {
            return
          }

          const dx =
            event.clientX -
            state.startX

          if (
            Math.abs(dx) >
            DRAG_THRESHOLD
          ) {

            state.hasDragged =
              true
          }

          event.preventDefault()

          container.scrollLeft =
            state.scrollLeft - dx
        }

      /* ========================================
         STOP DRAG
      ======================================== */

      const stopDragging =
        () => {

          state.isDragging =
            false

          container.style.cursor =
            "grab"
        }

      /* ========================================
         BLOCK CLICK AFTER DRAG
      ======================================== */

      const handleClick =
        (event) => {

          if (
            !state.hasDragged
          ) {
            return
          }

          event.preventDefault()

          event.stopPropagation()
        }

      /* ========================================
         EVENTS
      ======================================== */

      container.addEventListener(
        "pointerdown",
        handlePointerDown
      )

      window.addEventListener(
        "pointermove",
        handlePointerMove,
        {
          passive: false,
        }
      )

      window.addEventListener(
        "pointerup",
        stopDragging
      )

      window.addEventListener(
        "pointercancel",
        stopDragging
      )

      container.addEventListener(
        "click",
        handleClick,
        true
      )

      /* ========================================
         CLEANUP
      ======================================== */

      return () => {

        container.removeEventListener(
          "pointerdown",
          handlePointerDown
        )

        window.removeEventListener(
          "pointermove",
          handlePointerMove
        )

        window.removeEventListener(
          "pointerup",
          stopDragging
        )

        window.removeEventListener(
          "pointercancel",
          stopDragging
        )

        container.removeEventListener(
          "click",
          handleClick,
          true
        )
      }

    }, [])

    return scrollRef
  }

export default useHorizontalDragScroll