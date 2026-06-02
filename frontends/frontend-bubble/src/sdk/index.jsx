import React from "react"
import { createRoot } from "react-dom/client"

import "../index.css"

import BubbleChat from "../bubble-chat/BubbleChat.jsx"

import { updateRuntimeConfig } from "../config/sqlVariables"

const widgetRoots = new Map()

const DEFAULT_ROOT_ID = "lemonsquare-chat-root"

const STORAGE_KEYS = [
  "userToken",
  "user_id",
  "userid",
  "employee_id",
  "employeeId",
  "currentUserId",
]

/* ========================================
   HELPERS
======================================== */

const safeString = (value) =>
  value &&
  value !== "null" &&
  value !== "undefined"
    ? String(value)
    : null

const resolveFromStorage = (storage) => {
  for (const key of STORAGE_KEYS) {
    const value = safeString(
      storage.getItem(key)
    )

    if (value) {
      return value
    }
  }

  return null
}

/* ========================================
   AUTO USER DETECTION
======================================== */

const resolveUserToken = (
  incomingConfig = {}
) =>
  safeString(incomingConfig?.userId) ||
  safeString(incomingConfig?.userToken) ||
  safeString(window?.CURRENT_USER_ID) ||
  safeString(window?.currentUser?.id) ||
  safeString(window?.user?.id) ||
  safeString(window?.authUser?.id) ||
  resolveFromStorage(localStorage) ||
  resolveFromStorage(sessionStorage) ||
  safeString(
    document.querySelector(
      'meta[name="user-id"]'
    )?.content
  ) ||
  null

/* ========================================
   ROOT MANAGEMENT
======================================== */

const createContainer = (
  containerId = DEFAULT_ROOT_ID
) => {
  let element =
    document.getElementById(
      containerId
    )

  if (element) {
    return element
  }

  element = document.createElement(
    "div"
  )

  element.id = containerId

  document.body.appendChild(
    element
  )

  return element
}

const destroy = (
  containerId = DEFAULT_ROOT_ID
) => {
  const root =
    widgetRoots.get(containerId)

  if (!root) {
    return
  }

  root.unmount()

  widgetRoots.delete(
    containerId
  )
}

/* ========================================
   CONFIG
======================================== */

const updateConfig = (
  nextConfig = {}
) => {
  const resolvedUserId =
    resolveUserToken(
      nextConfig
    )

  const finalConfig = {
    ...nextConfig,

    userId:
      resolvedUserId,

    /*
      Backward compatibility.

      Internal services still read:
      getRuntimeConfig().userToken

      until we complete a full migration.
    */
    userToken:
      resolvedUserId,
  }

  window.LemonSquareChatConfig = {
    ...(window.LemonSquareChatConfig ||
      {}),
    ...finalConfig,
  }

  updateRuntimeConfig(
    finalConfig
  )

  console.log(
    "SDK_CONFIG_UPDATED",
    window.LemonSquareChatConfig
  )
}

/* ========================================
   MOUNT
======================================== */

const mount = ({
  containerId = DEFAULT_ROOT_ID,
  config = {},
} = {}) => {
  updateConfig(config)

  destroy(containerId)

  const container =
    createContainer(containerId)

  container.classList.add(
    "lemonsquare-chat-root"
  )

  const root =
    createRoot(container)

  root.render(<BubbleChat />)

  widgetRoots.set(
    containerId,
    root
  )

  return {
    destroy: () =>
      destroy(containerId),
  }
}

/* ========================================
   GLOBAL SDK
======================================== */

const LemonSquareChat = {
  mount,
  destroy,
  updateConfig,
}

window.LemonSquareChat =
  LemonSquareChat

export default LemonSquareChat