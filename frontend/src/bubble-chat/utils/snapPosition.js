import { CHAT_CONFIG } from "../constants/chatConfig"

export const getSnapPosition = (x, y) => {
  const {
    EDGE_PADDING,
    BUBBLE_SIZE,
  } = CHAT_CONFIG

  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  /* LEFT OR RIGHT SNAP */
  const snapLeft =
    x < screenWidth / 2

  /* HORIZONTAL SNAP */
  const snapX = snapLeft
    ? EDGE_PADDING
    : screenWidth -
      BUBBLE_SIZE -
      EDGE_PADDING

  /* KEEP NATURAL Y POSITION */
  const snapY = Math.min(
    Math.max(
      EDGE_PADDING,
      y
    ),

    screenHeight -
      BUBBLE_SIZE -
      EDGE_PADDING
  )

  return {
    x: snapX,
    y: snapY,
  }
}