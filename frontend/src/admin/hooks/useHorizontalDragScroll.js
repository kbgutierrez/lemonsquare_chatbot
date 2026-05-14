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

      let startX = 0

      let scrollLeft = 0

      const handleMouseDown =
        (event) => {

          isDown = true

          startX =
            event.pageX -
            container.offsetLeft

          scrollLeft =
            container.scrollLeft
        }

      const handleMouseLeave =
        () => {

          isDown = false
        }

      const handleMouseUp =
        () => {

          isDown = false
        }

      const handleMouseMove =
        (event) => {

          if (!isDown) {
            return
          }

          event.preventDefault()

          const x =
            event.pageX -
            container.offsetLeft

          const walk =
            (x - startX) * 1.2

          container.scrollLeft =
            scrollLeft - walk
        }

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
      }

    }, [ref])

  }