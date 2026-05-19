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
       POINTER STATE
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
       CLAMP POSITION
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
       STOP DRAG
    ======================================== */

    const stopDrag =
      useCallback(
        () => {

          pointerDown.current =
            false

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
        },
        [position]
      )

    /* ========================================
       EVENTS
    ======================================== */

    useEffect(() => {

      const handlePointerMove =
        (event) => {

          if (
            !pointerDown.current
          ) {
            return
          }

          const dx =
            event.clientX -
            startPoint.current.x

          const dy =
            event.clientY -
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
              event.clientX -
                dragOffset.current.x,

              event.clientY -
                dragOffset.current.y
            )

          setPosition(
            nextPosition
          )
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
        "pointermove",
        handlePointerMove
      )

      window.addEventListener(
        "pointerup",
        stopDrag
      )

      window.addEventListener(
        "pointercancel",
        stopDrag
      )

      window.addEventListener(
        "resize",
        handleResize
      )

      return () => {

        window.removeEventListener(
          "pointermove",
          handlePointerMove
        )

        window.removeEventListener(
          "pointerup",
          stopDrag
        )

        window.removeEventListener(
          "pointercancel",
          stopDrag
        )

        window.removeEventListener(
          "resize",
          handleResize
        )
      }

    }, [
      stopDrag,
      BUBBLE_SIZE,
      EDGE_PADDING,
    ])

    /* ========================================
       START DRAG
    ======================================== */

    const startDrag =
      (event) => {

        /*
          RESET POINTER STATE
        */

        pointerDown.current =
          true

        moved.current =
          false

        /*
          DO NOT USE
          setPointerCapture()

          It causes sticky pointer
          lifecycle bugs after reopen
          on some browsers/devices.
        */

        startPoint.current = {
          x: event.clientX,
          y: event.clientY,
        }

        dragOffset.current = {

          x:
            event.clientX -
            position.x,

          y:
            event.clientY -
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
       SNAP TO CORNER
       WHEN WINDOW OPENS
    ======================================== */

    const repositionForWindow =
      useCallback(
        () => {

          const snapped =
            getCornerSnapPosition(
              freePosition.current.x,
              freePosition.current.y
            )

          setPosition(
            snapped
          )
        },
        []
      )

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