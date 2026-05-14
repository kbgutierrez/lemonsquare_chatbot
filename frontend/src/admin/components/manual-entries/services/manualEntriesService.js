import {
  API_CONFIG,
  API_ENDPOINTS,
} from "../../../../config/sqlVariables"

import normalizeManualEntry
  from "../utils/normalizeManualEntry"

/* ========================================
   BASE URLS
======================================== */

const API_URL =
  `${API_CONFIG.BASE_URL}${API_ENDPOINTS.DOCUMENT_MANUAL_ENTRY}`

/* ========================================
   FETCH ENTRIES
======================================== */

export const fetchManualEntries =
  async () => {

    const response =
      await fetch(
        API_URL
      )

    if (
      !response.ok
    ) {

      throw new Error(
        `Failed to fetch entries (${response.status})`
      )
    }

    const data =
      await response.json()

    console.log(
      "FETCH_MANUAL_ENTRIES_RESPONSE",
      data
    )

    return Array.isArray(
      data
    )
      ? data.map(
          normalizeManualEntry
        )
      : []
  }

/* ========================================
   CREATE ENTRY
======================================== */

export const createManualEntry =
  async (form) => {

    const response =
      await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              form
            ),
        }
      )

    let responseData =
      null

    try {

      responseData =
        await response.json()

    } catch {

      responseData =
        null
    }

    console.log(
      "CREATE_MANUAL_ENTRY_RESPONSE",
      responseData
    )

    if (
      !response.ok
    ) {

      throw new Error(
        responseData?.detail ||
          responseData?.message ||
          `Failed to create manual entry (${response.status})`
      )
    }

    return responseData
  }

/* ========================================
   UPDATE ENTRY
======================================== */

export const updateManualEntry =
  async (
    entryId,
    form
  ) => {

    console.log(
      "UPDATE_MANUAL_ENTRY_ID",
      entryId
    )

    console.log(
      "UPDATE_MANUAL_ENTRY_FORM",
      form
    )

    if (
      entryId === undefined ||
      entryId === null ||
      entryId === ""
    ) {

      throw new Error(
        "Missing manual entry ID."
      )
    }

    const response =
      await fetch(
        `${API_URL}/${entryId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(
              form
            ),
        }
      )

    let responseData =
      null

    try {

      responseData =
        await response.json()

    } catch {

      responseData =
        null
    }

    console.log(
      "UPDATE_MANUAL_ENTRY_RESPONSE",
      responseData
    )

    if (
      !response.ok
    ) {

      throw new Error(
        responseData?.detail ||
          responseData?.message ||
          `Failed to update manual entry (${response.status})`
      )
    }

    return responseData
  }

/* ========================================
   DELETE ENTRY
======================================== */

export const deleteManualEntry =
  async (entryId) => {

    console.log(
      "DELETE_MANUAL_ENTRY_ID",
      entryId
    )

    if (
      entryId === undefined ||
      entryId === null ||
      entryId === ""
    ) {

      throw new Error(
        "Missing manual entry ID."
      )
    }

    const response =
      await fetch(
        `${API_URL}/${entryId}`,
        {
          method:
            "DELETE",
        }
      )

    let responseData =
      null

    try {

      responseData =
        await response.json()

    } catch {

      responseData =
        null
    }

    console.log(
      "DELETE_MANUAL_ENTRY_RESPONSE",
      responseData
    )

    if (
      !response.ok
    ) {

      throw new Error(
        responseData?.detail ||
          responseData?.message ||
          `Failed to delete manual entry (${response.status})`
      )
    }

    return responseData
  }

/* ========================================
   EXPORT
======================================== */

const manualEntriesService =
  {
    fetchManualEntries,
    createManualEntry,
    updateManualEntry,
    deleteManualEntry,
  }

export default manualEntriesService