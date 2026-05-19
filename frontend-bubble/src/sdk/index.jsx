import React from "react"
import { createRoot } from "react-dom/client"

import "../index.css"

import BubbleChat from "../bubble-chat/BubbleChat.jsx"

import {
  updateRuntimeConfig,
} from "../config/sqlVariables"

const widgetRoots =
  new Map()

const DEFAULT_ROOT_ID =
  "lemonsquare-chat-root"

const DEFAULT_FALLBACK_USER =
  "11318"

/* ========================================
   AUTO USER DETECTION
======================================== */

const resolveUserToken =
  (
    incomingConfig = {}
  ) => {

    /*
      PRIORITY 1:
      MANUAL CONFIG OVERRIDE
    */

    if (
      incomingConfig?.userToken
    ) {
      return String(
        incomingConfig.userToken
      )
    }

    /*
      PRIORITY 2:
      CUSTOM GLOBAL USER
    */

    if (
      window?.CURRENT_USER_ID
    ) {
      return String(
        window.CURRENT_USER_ID
      )
    }

    /*
      PRIORITY 3:
      COMMON AUTH OBJECTS
    */

    if (
      window?.currentUser?.id
    ) {
      return String(
        window.currentUser.id
      )
    }

    if (
      window?.user?.id
    ) {
      return String(
        window.user.id
      )
    }

    if (
      window?.authUser?.id
    ) {
      return String(
        window.authUser.id
      )
    }

    /*
      PRIORITY 4:
      LOCAL STORAGE
    */

    const localStorageKeys =
      [
        "userToken",
        "user_id",
        "userid",
        "employee_id",
        "employeeId",
        "currentUserId",
      ]

    for (
      const key
      of localStorageKeys
    ) {

      const value =
        localStorage.getItem(
          key
        )

      if (
        value &&
        value !== "null" &&
        value !== "undefined"
      ) {
        return String(
          value
        )
      }
    }

    /*
      PRIORITY 5:
      SESSION STORAGE
    */

    for (
      const key
      of localStorageKeys
    ) {

      const value =
        sessionStorage.getItem(
          key
        )

      if (
        value &&
        value !== "null" &&
        value !== "undefined"
      ) {
        return String(
          value
        )
      }
    }

    /*
      PRIORITY 6:
      META TAG
    */

    const metaUser =
      document.querySelector(
        'meta[name="user-id"]'
      )

    if (
      metaUser?.content
    ) {
      return String(
        metaUser.content
      )
    }

    /*
      FINAL FALLBACK
    */

    return DEFAULT_FALLBACK_USER
  }

/* ========================================
   CREATE ROOT ELEMENT
======================================== */

const createContainer =
  (
    containerId =
      DEFAULT_ROOT_ID
  ) => {

    let element =
      document.getElementById(
        containerId
      )

    if (!element) {

      element =
        document.createElement(
          "div"
        )

      element.id =
        containerId

      document.body.appendChild(
        element
      )
    }

    return element
  }

/* ========================================
   DESTROY
======================================== */

const destroy =
  (
    containerId =
      DEFAULT_ROOT_ID
  ) => {

    const root =
      widgetRoots.get(
        containerId
      )

    if (!root) {
      return
    }

    root.unmount()

    widgetRoots.delete(
      containerId
    )
  }

/* ========================================
   UPDATE CONFIG
======================================== */

const updateConfig =
  (
    nextConfig = {}
  ) => {

    /*
      AUTO-RESOLVE USER TOKEN
    */

    const resolvedUserToken =
      resolveUserToken(
        nextConfig
      )

    const finalConfig =
      {
        ...nextConfig,
        userToken:
          resolvedUserToken,
      }

    /*
      GLOBAL WINDOW CONFIG
    */

    window.LemonSquareChatConfig =
      {
        ...(window.LemonSquareChatConfig || {}),
        ...finalConfig,
      }

    /*
      IMPORTANT:
      UPDATE INTERNAL RUNTIME CONFIG
    */

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

const mount =
  ({
    containerId =
      DEFAULT_ROOT_ID,

    config = {},
  } = {}) => {

    /*
      APPLY CONFIG FIRST
    */

    updateConfig(
      config
    )

    /*
      Prevent duplicate mounts
    */

    destroy(
      containerId
    )

    const container =
      createContainer(
        containerId
      )

    /*
      IMPORTANT:
      APPLY ROOT CLASS
    */

    container.classList.add(
      "lemonsquare-chat-root"
    )

    const root =
      createRoot(
        container
      )

    root.render(
      <BubbleChat />
    )

    widgetRoots.set(
      containerId,
      root
    )

    return {
      destroy:
        () =>
          destroy(
            containerId
          ),
    }
  }

/* ========================================
   GLOBAL SDK
======================================== */

window.LemonSquareChat = {
  mount,
  destroy,
  updateConfig,
}

export default
  window.LemonSquareChat