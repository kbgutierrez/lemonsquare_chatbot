import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  CHAT_CONFIG,
} from "../constants/chatConfig"

import {
  getSnapPosition,
} from "../utils/snapPosition"

const DRAG_THRESHOLD = 6

export const useBubbleDrag =
  () => {

    const {
      BUBBLE_SIZE,
    } = CHAT_CONFIG

    const [dragging, setDragging] =
      useState(false)

    const [position, setPosition] =
      useState(() =>
        getSnapPosition(
          window.innerWidth - 100,
          window.innerHeight - 100
        )
      )

    /* POINTER */
    const pointerDown =
      useRef(false)

    const moved =
      useRef(false)

    const startPoint =
      useRef({
        x: 0,
        y: 0,
      })

    const dragOffset =
      useRef({
        x: 0,
        y: 0,
      })

    /*
      REMEMBER SIDES

      IMPORTANT FOR:
      - maximize
      - minimize
      - rotate
      - resize
    */

    const lastHorizontalSide =
      useRef("right")

    const lastVerticalSide =
      useRef("bottom")

    /* SIDE */
    const isLeftSide =
      useMemo(
        () =>
          position.x <
          window.innerWidth / 2,

        [position.x]
      )

    const isTopSide =
      useMemo(
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

    /* EVENTS */
    useEffect(() => {

      const move =
        (
          clientX,
          clientY
        ) => {

          if (
            !pointerDown.current
          ) return

          const dx =
            clientX -
            startPoint.current.x

          const dy =
            clientY -
            startPoint.current.y

          /*
            START DRAG
          */
          if (
            !moved.current &&
            (
              Math.abs(dx) >
                DRAG_THRESHOLD ||

              Math.abs(dy) >
                DRAG_THRESHOLD
            )
          ) {

            moved.current =
              true

            setDragging(true)
          }

          /*
            IGNORE MICRO MOVES
          */
          if (
            !moved.current
          ) return

          /*
            REMEMBER SIDE
          */
          lastHorizontalSide.current =
            clientX <
            window.innerWidth / 2
              ? "left"
              : "right"

          lastVerticalSide.current =
            clientY <
            window.innerHeight / 2
              ? "top"
              : "bottom"

          setPosition(
            clampPosition(
              clientX -
                dragOffset.current.x,

              clientY -
                dragOffset.current.y
            )
          )
        }

      const mouseMove =
        (event) =>
          move(
            event.clientX,
            event.clientY
          )

      const touchMove =
        (event) => {

          const touch =
            event.touches[0]

          move(
            touch.clientX,
            touch.clientY
          )
        }

      const stopDrag =
        () => {

          pointerDown.current =
            false

          /*
            SNAP TO EDGE
          */
          if (
            moved.current
          ) {

            setPosition(
              (prev) =>
                getSnapPosition(
                  prev.x,
                  prev.y
                )
            )
          }

          setDragging(false)
        }

      /*
        WINDOW RESIZE
      */
      const handleResize =
        () => {

          const padding = 20

          setPosition({
            x:
              lastHorizontalSide.current ===
              "left"
                ? padding
                : window.innerWidth -
                  BUBBLE_SIZE -
                  padding,

            y:
              lastVerticalSide.current ===
              "top"
                ? padding
                : window.innerHeight -
                  BUBBLE_SIZE -
                  padding,
          })
        }

      window.addEventListener(
        "mousemove",
        mouseMove
      )

      window.addEventListener(
        "mouseup",
        stopDrag
      )

      window.addEventListener(
        "touchmove",
        touchMove,
        {
          passive: true,
        }
      )

      window.addEventListener(
        "touchend",
        stopDrag
      )

      window.addEventListener(
        "resize",
        handleResize
      )

      return () => {

        window.removeEventListener(
          "mousemove",
          mouseMove
        )

        window.removeEventListener(
          "mouseup",
          stopDrag
        )

        window.removeEventListener(
          "touchmove",
          touchMove
        )

        window.removeEventListener(
          "touchend",
          stopDrag
        )

        window.removeEventListener(
          "resize",
          handleResize
        )
      }

    }, [BUBBLE_SIZE])

    /* START */
    const startDrag =
      (event) => {

        const point =
          event.touches?.[0] ||
          event

        pointerDown.current =
          true

        moved.current =
          false

        startPoint.current = {
          x: point.clientX,
          y: point.clientY,
        }

        dragOffset.current = {
          x:
            point.clientX -
            position.x,

          y:
            point.clientY -
            position.y,
        }
      }

    /* DRAG CHECK */
    const wasDragged =
      () =>
        moved.current

    /*
      SMART OPEN
    */
    const repositionForWindow =
      () => {

        const padding = 20

        setPosition({
          x:
            lastHorizontalSide.current ===
            "left"
              ? padding
              : window.innerWidth -
                BUBBLE_SIZE -
                padding,

          y:
            lastVerticalSide.current ===
            "top"
              ? padding
              : window.innerHeight -
                BUBBLE_SIZE -
                padding,
        })
      }

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