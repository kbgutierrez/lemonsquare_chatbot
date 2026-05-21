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

    /* ========================================
       HELPERS
    ======================================== */

    const getDefaultPosition =
      () => ({
        x:
          window.innerWidth -
          BUBBLE_SIZE -
          EDGE_PADDING,

        y:
          window.innerHeight -
          BUBBLE_SIZE -
          EDGE_PADDING,
      })

    const clampPosition =
      useCallback(
        (
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
        }),
        [
          BUBBLE_SIZE,
          EDGE_PADDING,
        ]
      )

    /* ========================================
       STATE
    ======================================== */

    const [dragging, setDragging] =
      useState(false)

    const [position, setPosition] =
      useState(
        getDefaultPosition
      )

    /* ========================================
       INTERNAL STATE
    ======================================== */

    const refs =
      useRef({
        pointerDown: false,
        moved: false,

        freePosition:
          getDefaultPosition(),

        startPoint: {
          x: 0,
          y: 0,
        },

        dragOffset: {
          x: 0,
          y: 0,
        },
      })

    const state =
      refs.current

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
       STOP DRAG
    ======================================== */

    const stopDrag =
      useCallback(
        () => {

          state.pointerDown =
            false

          if (
            state.moved
          ) {

            const snapped =
              getSideSnapPosition(
                position.x,
                position.y
              )

            state.freePosition =
              snapped

            setPosition(
              snapped
            )
          }

          state.moved =
            false

          setDragging(false)
        },
        [position, state]
      )

    /* ========================================
       POINTER MOVE
    ======================================== */

    const handlePointerMove =
      useCallback(
        event => {

          if (
            !state.pointerDown
          ) {

            return
          }

          const dx =
            event.clientX -
            state.startPoint.x

          const dy =
            event.clientY -
            state.startPoint.y

          const exceededThreshold =
            Math.abs(dx) >
              DRAG_THRESHOLD ||
            Math.abs(dy) >
              DRAG_THRESHOLD

          /*
            START DRAG
          */

          if (
            exceededThreshold &&
            !state.moved
          ) {

            state.moved =
              true

            setDragging(true)
          }

          /*
            IGNORE SMALL MOVES
          */

          if (
            !state.moved
          ) {

            return
          }

          setPosition(
            clampPosition(
              event.clientX -
                state.dragOffset.x,

              event.clientY -
                state.dragOffset.y
            )
          )
        },
        [
          clampPosition,
          state,
        ]
      )

    /* ========================================
       HANDLE RESIZE
    ======================================== */

    const handleResize =
      useCallback(
        () => {

          const clamped =
            clampPosition(
              state.freePosition.x,
              state.freePosition.y
            )

          state.freePosition =
            clamped

          setPosition(
            clamped
          )
        },
        [
          clampPosition,
          state,
        ]
      )

    /* ========================================
       EVENTS
    ======================================== */

    useEffect(() => {

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
      handlePointerMove,
      handleResize,
      stopDrag,
    ])

    /* ========================================
       START DRAG
    ======================================== */

    const startDrag =
      useCallback(
        event => {

          state.pointerDown =
            true

          state.moved =
            false

          /*
            DO NOT USE
            setPointerCapture()

            Causes sticky pointer
            bugs on some browsers.
          */

          state.startPoint = {
            x: event.clientX,
            y: event.clientY,
          }

          state.dragOffset = {

            x:
              event.clientX -
              position.x,

            y:
              event.clientY -
              position.y,
          }
        },
        [position, state]
      )

    /* ========================================
       DRAG CHECK
    ======================================== */

    const wasDragged =
      useCallback(
        () =>
          state.moved,
        [state]
      )

    /* ========================================
       SNAP TO WINDOW CORNER
    ======================================== */

    const repositionForWindow =
      useCallback(
        () => {

          const snapped =
            getCornerSnapPosition(
              state.freePosition.x,
              state.freePosition.y
            )

          setPosition(
            snapped
          )
        },
        [state]
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