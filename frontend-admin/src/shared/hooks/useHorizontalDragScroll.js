import {
  useEffect,
} from "react"

export const useHorizontalDragScroll =
  (ref) => {

    useEffect(() => {

      const container =
        ref.current

      if (!container) {
        return
      }

      let isDown = false

      let isDragging = false

      let startX = 0

      let scrollLeft = 0

      /* ========================================
         MOUSE DOWN
      ======================================== */

      const handleMouseDown =
        (event) => {

          isDown = true

          isDragging = false

          startX =
            event.pageX -
            container.offsetLeft

          scrollLeft =
            container.scrollLeft
        }

      /* ========================================
         MOUSE LEAVE
      ======================================== */

      const handleMouseLeave =
        () => {

          isDown = false
        }

      /* ========================================
         MOUSE UP
      ======================================== */

      const handleMouseUp =
        () => {

          isDown = false

          /*
            Small timeout prevents
            immediate click firing
            after drag release.
          */

          setTimeout(() => {

            isDragging = false

          }, 0)
        }

      /* ========================================
         MOUSE MOVE
      ======================================== */

      const handleMouseMove =
        (event) => {

          if (!isDown) {
            return
          }

          const x =
            event.pageX -
            container.offsetLeft

          const walk =
            (x - startX) * 1.2

          /*
            Only activate drag mode
            after minimum movement.
          */

          if (
            Math.abs(walk) > 6
          ) {

            isDragging = true
          }

          if (!isDragging) {
            return
          }

          event.preventDefault()

          container.scrollLeft =
            scrollLeft - walk
        }

      /* ========================================
         PREVENT CLICK AFTER DRAG
      ======================================== */

      const handleClickCapture =
        (event) => {

          if (!isDragging) {
            return
          }

          event.preventDefault()

          event.stopPropagation()
        }

      /* ========================================
         EVENTS
      ======================================== */

      container.addEventListener(
        "mousedown",
        handleMouseDown
      )

      container.addEventListener(
        "mouseleave",
        handleMouseLeave
      )

      container.addEventListener(
        "mouseup",
        handleMouseUp
      )

      container.addEventListener(
        "mousemove",
        handleMouseMove
      )

      container.addEventListener(
        "click",
        handleClickCapture,
        true
      )

      /* ========================================
         CLEANUP
      ======================================== */

      return () => {

        container.removeEventListener(
          "mousedown",
          handleMouseDown
        )

        container.removeEventListener(
          "mouseleave",
          handleMouseLeave
        )

        container.removeEventListener(
          "mouseup",
          handleMouseUp
        )

        container.removeEventListener(
          "mousemove",
          handleMouseMove
        )

        container.removeEventListener(
          "click",
          handleClickCapture,
          true
        )
      }

    }, [ref])

  }