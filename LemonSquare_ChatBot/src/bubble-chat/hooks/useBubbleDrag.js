import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { CHAT_CONFIG } from "../constants/chatConfig"
import { getSnapPosition } from "../utils/snapPosition"

export const useBubbleDrag = () => {
  const { BUBBLE_SIZE } =
    CHAT_CONFIG

  const [dragging, setDragging] =
    useState(false)

  const [position, setPosition] =
    useState(() =>
      getSnapPosition(
        window.innerWidth - 100,
        window.innerHeight - 100
      )
    )

  const dragOffset = useRef({
    x: 0,
    y: 0,
  })

  const dragTimer = useRef(null)

  /* SIDES */
  const isLeftSide = useMemo(
    () =>
      position.x <
      window.innerWidth / 2,

    [position.x]
  )

  const isTopSide = useMemo(
    () =>
      position.y <
      window.innerHeight / 2,

    [position.y]
  )

  /* CLAMP */
  const clampPosition = (
    x,
    y
  ) => ({
    x: Math.min(
      Math.max(0, x),
      window.innerWidth -
        BUBBLE_SIZE
    ),

    y: Math.min(
      Math.max(0, y),
      window.innerHeight -
        BUBBLE_SIZE
    ),
  })

  /* SMART OPEN SNAP */
  const repositionForWindow =
    () => {

      const padding = 20
      const chatWidth =
        Math.min(
          380,
          window.innerWidth *
            0.94
        )

      const chatHeight =
        Math.min(
          520,
          window.innerHeight -
            40
        )

      setPosition((prev) => {
        let nextX = prev.x
        let nextY = prev.y

        const nearLeft =
          prev.x <
          window.innerWidth / 2

        const nearTop =
          prev.y <
          window.innerHeight /
            2

        /* LEFT / RIGHT */
        nextX = nearLeft
          ? padding
          : window.innerWidth -
            BUBBLE_SIZE -
            padding

        /* TOP / BOTTOM */
        nextY = nearTop
          ? padding
          : window.innerHeight -
            BUBBLE_SIZE -
            padding

        /* BOTTOM SAFE */
        if (
          !nearTop &&
          nextY <
            chatHeight
        ) {
          nextY =
            window.innerHeight -
            BUBBLE_SIZE -
            padding
        }

        return clampPosition(
          nextX,
          nextY
        )
      })
    }

  useEffect(() => {
    const move = (
      clientX,
      clientY
    ) => {

      setPosition(
        clampPosition(
          clientX -
            dragOffset.current.x,

          clientY -
            dragOffset.current.y
        )
      )
    }

    const handleMouseMove =
      (e) => {

        if (!dragging) return

        move(
          e.clientX,
          e.clientY
        )
      }

    const handleTouchMove =
      (e) => {

        if (!dragging) return

        const touch =
          e.touches[0]

        move(
          touch.clientX,
          touch.clientY
        )
      }

    const stopDragging =
      () => {

        if (!dragging) return

        setPosition((prev) =>
          getSnapPosition(
            prev.x,
            prev.y
          )
        )

        setDragging(false)
      }

    const handleResize =
      () => {

        setPosition((prev) =>
          getSnapPosition(
            prev.x,
            prev.y
          )
        )
      }

    window.addEventListener(
      "mousemove",
      handleMouseMove
    )

    window.addEventListener(
      "mouseup",
      stopDragging
    )

    window.addEventListener(
      "touchmove",
      handleTouchMove,
      { passive: true }
    )

    window.addEventListener(
      "touchend",
      stopDragging
    )

    window.addEventListener(
      "resize",
      handleResize
    )

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      )

      window.removeEventListener(
        "mouseup",
        stopDragging
      )

      window.removeEventListener(
        "touchmove",
        handleTouchMove
      )

      window.removeEventListener(
        "touchend",
        stopDragging
      )

      window.removeEventListener(
        "resize",
        handleResize
      )
    }
  }, [dragging, BUBBLE_SIZE])

  /* START DRAG */
  const startDrag = (
    event
  ) => {

    const point =
      event.touches?.[0] ||
      event

    dragOffset.current = {
      x:
        point.clientX -
        position.x,

      y:
        point.clientY -
        position.y,
    }

    dragTimer.current =
      setTimeout(() => {
        setDragging(true)
      }, 120)
  }

  /* STOP */
  const stopDrag = () => {
    clearTimeout(
      dragTimer.current
    )
  }

  return {
    dragging,
    position,
    isLeftSide,
    isTopSide,
    startDrag,
    stopDrag,
    repositionForWindow,
  }
}