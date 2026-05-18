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
      GLOBAL WINDOW CONFIG
    */

    window.LemonSquareChatConfig =
      {
        ...(window.LemonSquareChatConfig || {}),
        ...nextConfig,
      }

    /*
      IMPORTANT:
      UPDATE INTERNAL RUNTIME CONFIG
    */

    updateRuntimeConfig(
      nextConfig
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