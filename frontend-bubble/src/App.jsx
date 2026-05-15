import {
  useEffect,
  useMemo,
  useState,
} from "react"

import BubbleChat
  from "./bubble-chat/BubbleChat.jsx"

/* ========================================
   SDK CONFIG HELPERS
======================================== */

const DEFAULT_CONFIG = {
  apiBaseUrl:
    import.meta.env
      .VITE_API_BASE_URL ||
    "/api",

  userToken: null,

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

    setSdkConfig(
      (
        previous
      ) => ({
        ...previous,
        ...externalConfig,
      })
    )

    console.log(
      "LEMONSQUARE_WIDGET_CONFIG",
      {
        ...DEFAULT_CONFIG,
        ...externalConfig,
      }
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
      <BubbleChat
        runtimeConfig={
          runtimeConfig
        }
      />
    </div>
  )
}

export default App