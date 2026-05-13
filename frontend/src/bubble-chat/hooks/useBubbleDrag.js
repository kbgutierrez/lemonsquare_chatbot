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
  getCornerSnapPosition,
  getSideSnapPosition,
} from "../utils/snapPosition"

const DRAG_THRESHOLD = 6

export const useBubbleDrag =
  () => {

    const {
      BUBBLE_SIZE,
      EDGE_PADDING,
    } = CHAT_CONFIG

    const [dragging, setDragging] =
      useState(false)

    const [position, setPosition] =
      useState(() => ({
        x:
          window.innerWidth -
          BUBBLE_SIZE -
          EDGE_PADDING,

        y:
          window.innerHeight -
          BUBBLE_SIZE -
          EDGE_PADDING,
      }))

    /*
      REMEMBER CLOSED POSITION
    */

    const freePosition =
      useRef({
        x:
          window.innerWidth -
          BUBBLE_SIZE -
          EDGE_PADDING,

        y:
          window.innerHeight -
          BUBBLE_SIZE -
          EDGE_PADDING,
      })

    /* ========================================
       POINTER
    ======================================== */

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

    /* ========================================
       SIDE DETECTION
    ======================================== */

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

    /* ========================================
       CLAMP
    ======================================== */

    const clampPosition = (
      x,
      y
    ) => ({
      x: Math.min(
        Math.max(
          EDGE_PADDING,
          x
        ),

        window.innerWidth -
          BUBBLE_SIZE -
          EDGE_PADDING
      ),

      y: Math.min(
        Math.max(
          EDGE_PADDING,
          y
        ),

        window.innerHeight -
          BUBBLE_SIZE -
          EDGE_PADDING
      ),
    })

    /* ========================================
       EVENTS
    ======================================== */

    useEffect(() => {

      const move =
        (
          clientX,
          clientY
        ) => {

          if (
            !pointerDown.current
          ) {
            return
          }

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
            IGNORE SMALL MOVES
          */

          if (
            !moved.current
          ) {
            return
          }

          const nextPosition =
            clampPosition(
              clientX -
                dragOffset.current.x,

              clientY -
                dragOffset.current.y
            )

          /*
            TRUE FREE DRAG
          */

          setPosition(
            nextPosition
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
            SNAP TO NEAREST SIDE
            AFTER RELEASE
          */

          if (
            moved.current
          ) {

            const snapped =
              getSideSnapPosition(
                position.x,
                position.y
              )

            freePosition.current =
              snapped

            setPosition(
              snapped
            )
          }

          moved.current =
            false

          setDragging(false)
        }

      /* ========================================
         RESIZE
      ======================================== */

      const handleResize =
        () => {

          const clamped =
            clampPosition(
              freePosition.current.x,
              freePosition.current.y
            )

          freePosition.current =
            clamped

          setPosition(
            clamped
          )
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

    }, [
      position,
      BUBBLE_SIZE,
      EDGE_PADDING,
    ])

    /* ========================================
       START DRAG
    ======================================== */

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

    /* ========================================
       DRAG CHECK
    ======================================== */

    const wasDragged =
      () =>
        moved.current

    /* ========================================
       OPEN CHAT
       SNAP TO CORNER ONLY
    ======================================== */

    const repositionForWindow =
      () => {

        const snapped =
          getCornerSnapPosition(
            freePosition.current.x,
            freePosition.current.y
          )

        setPosition(
          snapped
        )
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