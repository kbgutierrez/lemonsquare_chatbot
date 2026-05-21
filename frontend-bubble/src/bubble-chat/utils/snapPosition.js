import { CHAT_CONFIG } from "../constants/chatConfig"

const {
  EDGE_PADDING,
  BUBBLE_SIZE,
} = CHAT_CONFIG

/* ========================================
   HELPERS
======================================== */

const getScreenBounds = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
})

const clamp = (
  value,
  min,
  max
) =>
  Math.min(
    Math.max(min, value),
    max
  )

const getMaxX = (width) =>
  width -
  BUBBLE_SIZE -
  EDGE_PADDING

const getMaxY = (height) =>
  height -
  BUBBLE_SIZE -
  EDGE_PADDING

const clampX = (
  x,
  width
) =>
  clamp(
    x,
    EDGE_PADDING,
    getMaxX(width)
  )

const clampY = (
  y,
  height
) =>
  clamp(
    y,
    EDGE_PADDING,
    getMaxY(height)
  )

/* ========================================
   SNAP TO NEAREST SCREEN SIDE
   (USED FOR CLOSED BUBBLE)
======================================== */

export const getSideSnapPosition = (
  x,
  y
) => {

  const {
    width,
    height,
  } = getScreenBounds()

  const distances = {
    left: x,
    right: width - x,
    top: y,
    bottom: height - y,
  }

  const nearestSide =
    Object.entries(distances)
      .sort(
        (a, b) => a[1] - b[1]
      )[0][0]

  const clampedX =
    clampX(x, width)

  const clampedY =
    clampY(y, height)

  switch (nearestSide) {

    case "left":
      return {
        x: EDGE_PADDING,
        y: clampedY,
      }

    case "right":
      return {
        x: getMaxX(width),
        y: clampedY,
      }

    case "top":
      return {
        x: clampedX,
        y: EDGE_PADDING,
      }

    default:
      return {
        x: clampedX,
        y: getMaxY(height),
      }
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
    width,
    height,
  } = getScreenBounds()

  return {
    x:
      x < width / 2
        ? EDGE_PADDING
        : getMaxX(width),

    y:
      y < height / 2
        ? EDGE_PADDING
        : getMaxY(height),
  }
}