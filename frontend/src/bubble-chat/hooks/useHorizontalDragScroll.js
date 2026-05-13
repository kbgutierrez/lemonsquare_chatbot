import {
  useEffect,
  useRef,
} from "react"

const useHorizontalDragScroll =
  () => {

    const scrollRef =
      useRef(null)

    const isDragging =
      useRef(false)

    const startX =
      useRef(0)

    const scrollLeft =
      useRef(0)

    useEffect(() => {

      const container =
        scrollRef.current

      if (!container)
        return

      const handleMouseDown =
        (event) => {

          isDragging.current =
            true

          startX.current =
            event.pageX -
            container.offsetLeft

          scrollLeft.current =
            container.scrollLeft
        }

      const handleMouseLeave =
        () => {

          isDragging.current =
            false
        }

      const handleMouseUp =
        () => {

          isDragging.current =
            false
        }

      const handleMouseMove =
        (event) => {

          if (
            !isDragging.current
          ) {
            return
          }

          event.preventDefault()

          const x =
            event.pageX -
            container.offsetLeft

          const walk =
            (
              x -
              startX.current
            ) * 1.1

          container.scrollLeft =
            scrollLeft.current -
            walk
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

    }, [])

    return scrollRef
  }

export default
useHorizontalDragScroll