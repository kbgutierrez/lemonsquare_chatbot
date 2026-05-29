import apiClient, {
  buildApiUrl,
} from "../../../../shared/api/client"

import {
  API_ENDPOINTS,
} from "../../../../shared/api/endpoints"

import normalizeManualEntry
  from "../utils/normalizeManualEntry"

/* ========================================
   BASE URL
======================================== */

const API_URL =
  buildApiUrl(
    API_ENDPOINTS.DOCUMENT_MANUAL_ENTRY
  )

/* ========================================
   SAFE ARRAY EXTRACTION
======================================== */

const extractEntriesArray =
  (payload) => {

    if (
      Array.isArray(
        payload
      )
    ) {

      return payload
    }

    const possibleArrays = [
      payload?.data,
      payload?.items,
      payload?.entries,
      payload?.results,
      payload?.manual_entries,
      payload?.manualEntries,
    ]

    for (const value of possibleArrays) {

      if (
        Array.isArray(
          value
        )
      ) {

        return value
      }
    }

    return []
  }

/* ========================================
   FETCH ENTRIES
======================================== */

export const fetchManualEntries =
  async () => {

    try {

      const response =
        await apiClient.get(
          API_URL
        )

      console.log(
        "FETCH_MANUAL_ENTRIES_RESPONSE",
        response
      )

      const entries =
        extractEntriesArray(
          response
        )

      return entries.map(
        normalizeManualEntry
      )

    } catch (error) {

      console.error(
        "FETCH_MANUAL_ENTRIES_FAILED",
        error
      )

      /*
        FRONTEND FALLBACK:
        Prevent page crash when backend
        returns 500.
      */

      return []
    }
  }

/* ========================================
   CREATE ENTRY
======================================== */

export const createManualEntry =
  async (form) => {

    console.log(
      "CREATE_MANUAL_ENTRY_FORM",
      form
    )

    const response =
      await apiClient.post(
        API_URL,
        form
      )

    console.log(
      "CREATE_MANUAL_ENTRY_RESPONSE",
      response
    )

    return response
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

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.DOCUMENT_MANUAL_ENTRY_UPDATE,
        {
          entryId,
        }
      )

    const response =
      await apiClient.put(
        endpoint,
        form
      )

    console.log(
      "UPDATE_MANUAL_ENTRY_RESPONSE",
      response
    )

    return response
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

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.DOCUMENT_MANUAL_ENTRY_DELETE,
        {
          entryId,
        }
      )

    const response =
      await apiClient.delete(
        endpoint
      )

    console.log(
      "DELETE_MANUAL_ENTRY_RESPONSE",
      response
    )

    return response
  }

/* ========================================
   HARD DELETE ENTRY
======================================== */

export const hardDeleteManualEntry =
  async (entryId) => {

    console.log(
      "HARD_DELETE_MANUAL_ENTRY_ID",
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

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.DOCUMENT_MANUAL_ENTRY_HARD_DELETE,
        {
          entryId,
        }
      )

    const response =
      await apiClient.delete(
        endpoint
      )

    console.log(
      "HARD_DELETE_MANUAL_ENTRY_RESPONSE",
      response
    )

    return response
  }

/* ========================================
   RESTORE ENTRY
======================================== */

export const restoreManualEntry =
  async (entryId) => {

    console.log(
      "RESTORE_MANUAL_ENTRY_ID",
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

    const endpoint =
      buildApiUrl(
        API_ENDPOINTS.DOCUMENT_MANUAL_ENTRY_RESTORE,
        {
          entryId,
        }
      )

    const response =
      await apiClient.post(
        endpoint
      )

    console.log(
      "RESTORE_MANUAL_ENTRY_RESPONSE",
      response
    )

    return response
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
    hardDeleteManualEntry,
    restoreManualEntry,
  }

export default manualEntriesService