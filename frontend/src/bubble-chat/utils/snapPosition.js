import { CHAT_CONFIG } from "../constants/chatConfig"

/* ========================================
   SNAP TO NEAREST SCREEN SIDE
   (USED FOR CLOSED BUBBLE)
======================================== */

export const getSideSnapPosition = (
  x,
  y
) => {

  const {
    EDGE_PADDING,
    BUBBLE_SIZE,
  } = CHAT_CONFIG

  const screenWidth =
    window.innerWidth

  const screenHeight =
    window.innerHeight

  /*
    DISTANCE TO SIDES
  */

  const leftDistance =
    x

  const rightDistance =
    screenWidth - x

  const topDistance =
    y

  const bottomDistance =
    screenHeight - y

  const minDistance =
    Math.min(
      leftDistance,
      rightDistance,
      topDistance,
      bottomDistance
    )

  /*
    LEFT SIDE
  */

  if (
    minDistance ===
    leftDistance
  ) {

    return {
      x: EDGE_PADDING,

      y: Math.min(
        Math.max(
          EDGE_PADDING,
          y
        ),

        screenHeight -
          BUBBLE_SIZE -
          EDGE_PADDING
      ),
    }
  }

  /*
    RIGHT SIDE
  */

  if (
    minDistance ===
    rightDistance
  ) {

    return {
      x:
        screenWidth -
        BUBBLE_SIZE -
        EDGE_PADDING,

      y: Math.min(
        Math.max(
          EDGE_PADDING,
          y
        ),

        screenHeight -
          BUBBLE_SIZE -
          EDGE_PADDING
      ),
    }
  }

  /*
    TOP SIDE
  */

  if (
    minDistance ===
    topDistance
  ) {

    return {
      x: Math.min(
        Math.max(
          EDGE_PADDING,
          x
        ),

        screenWidth -
          BUBBLE_SIZE -
          EDGE_PADDING
      ),

      y: EDGE_PADDING,
    }
  }

  /*
    BOTTOM SIDE
  */

  return {
    x: Math.min(
      Math.max(
        EDGE_PADDING,
        x
      ),

      screenWidth -
        BUBBLE_SIZE -
        EDGE_PADDING
    ),

    y:
      screenHeight -
      BUBBLE_SIZE -
      EDGE_PADDING,
  }
}

/* ========================================
   SNAP TO NEAREST CORNER
   (USED FOR OPEN WINDOW)
======================================== */

export const getCornerSnapPosition = (
  x,
  y
) => {

  const {
    EDGE_PADDING,
    BUBBLE_SIZE,
  } = CHAT_CONFIG

  const screenWidth =
    window.innerWidth

  const screenHeight =
    window.innerHeight

  const snapLeft =
    x < screenWidth / 2

  const snapTop =
    y < screenHeight / 2

  return {
    x: snapLeft
      ? EDGE_PADDING
      : screenWidth -
        BUBBLE_SIZE -
        EDGE_PADDING,

    y: snapTop
      ? EDGE_PADDING
      : screenHeight -
        BUBBLE_SIZE -
        EDGE_PADDING,
  }
}