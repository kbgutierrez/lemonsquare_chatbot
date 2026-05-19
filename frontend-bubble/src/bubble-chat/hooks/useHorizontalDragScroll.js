import {
  useEffect,
  useRef,
} from "react"

const DRAG_THRESHOLD = 5

const useHorizontalDragScroll =
  () => {

    const scrollRef =
      useRef(null)

    const isDragging =
      useRef(false)

    const hasDragged =
      useRef(false)

    const startX =
      useRef(0)

    const scrollLeft =
      useRef(0)

    useEffect(() => {

      const container =
        scrollRef.current

      if (!container) {
        return
      }

      /* ========================================
         POINTER DOWN
      ======================================== */

      const handlePointerDown =
        (event) => {

          isDragging.current =
            true

          hasDragged.current =
            false

          startX.current =
            event.clientX

          scrollLeft.current =
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
            !isDragging.current
          ) {
            return
          }

          const dx =
            event.clientX -
            startX.current

          /*
            DETECT REAL DRAG
          */

          if (
            Math.abs(dx) >
            DRAG_THRESHOLD
          ) {

            hasDragged.current =
              true
          }

          /*
            PREVENT TEXT SELECT
          */

          event.preventDefault()

          container.scrollLeft =
            scrollLeft.current - dx
        }

      /* ========================================
         STOP DRAG
      ======================================== */

      const stopDragging =
        () => {

          isDragging.current =
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
            hasDragged.current
          ) {

            event.preventDefault()

            event.stopPropagation()
          }
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

    })

    return scrollRef
  }

export default useHorizontalDragScroll