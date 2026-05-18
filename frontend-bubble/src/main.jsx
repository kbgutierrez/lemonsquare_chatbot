import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

import App from "./App.jsx"

/* ========================================
   SDK ROOT DETECTION
======================================== */

const DEFAULT_ROOT_ID =
  "root"

const SDK_ROOT_ID =
  "lemonsquare-chat-sdk-root"

const resolveRootElement =
  () => {

    /*
      PRIORITY:
      SDK root container
    */
    const sdkRoot =
      document.getElementById(
        SDK_ROOT_ID
      )

    if (sdkRoot) {

      return sdkRoot
    }

    /*
      FALLBACK:
      Normal Vite root
    */
    const defaultRoot =
      document.getElementById(
        DEFAULT_ROOT_ID
      )

    if (defaultRoot) {

      return defaultRoot
    }

    /*
      SAFETY:
      Auto-create SDK root
    */
    const createdRoot =
      document.createElement(
        "div"
      )

    createdRoot.id =
      SDK_ROOT_ID

    document.body.appendChild(
      createdRoot
    )

    return createdRoot
  }

/* ========================================
   ROOT
======================================== */

const rootElement =
  resolveRootElement()

createRoot(
  rootElement
).render(
  <StrictMode>
    <App />
  </StrictMode>
)