import {
  useEffect,
  useMemo,
  useState,
} from "react"

import BubbleChat
  from "./bubble-chat/BubbleChat.jsx"

import {
  updateRuntimeConfig,
} from "./config/sqlVariables"

/* ========================================
   SDK CONFIG HELPERS
======================================== */

const DEFAULT_CONFIG = {
  apiBaseUrl:
    import.meta.env
      .VITE_API_BASE_URL ||
    "/api",

  userToken:
    import.meta.env
      .VITE_DEV_USER_TOKEN ||
    "11318",

  environment:
    import.meta.env.MODE ||
    "development",
}

const resolveGlobalConfig =
  () => {

    /*
      FUTURE SDK SUPPORT

      Example:

      window.LemonSquareChatConfig = {
        apiBaseUrl: "...",
        userToken: "...",
      }
    */

    if (
      typeof window !==
        "undefined" &&
      window
        .LemonSquareChatConfig
    ) {

      return window
        .LemonSquareChatConfig
    }

    return {}
  }

/* ========================================
   APP
======================================== */

const App = () => {

  const [
    sdkConfig,
    setSdkConfig,
  ] = useState(
    DEFAULT_CONFIG
  )

  /* ========================================
     LOAD SDK CONFIG
  ======================================== */

  useEffect(() => {

    const externalConfig =
      resolveGlobalConfig()

    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...externalConfig,
    }

    setSdkConfig(
      mergedConfig
    )

    /*
      CRITICAL FIX:
      Sync runtime config back into
      SDK_RUNTIME_CONFIG.

      The frontend refactor removed
      this synchronization path,
      causing chatbotService to read
      stale/null userToken values.
    */

    updateRuntimeConfig(
      mergedConfig
    )

    console.log(
      "LEMONSQUARE_WIDGET_CONFIG",
      mergedConfig
    )

  }, [])

  /* ========================================
     MEMOIZED CONFIG
  ======================================== */

  const runtimeConfig =
    useMemo(
      () => sdkConfig,
      [sdkConfig]
    )

  return (
    <div
      className="
        lemonsquare-chat-root
      "
      data-environment={
        runtimeConfig.environment
      }
    >
      <BubbleChat />
    </div>
  )
}

export default App