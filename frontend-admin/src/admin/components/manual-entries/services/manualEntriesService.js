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
   FETCH ENTRIES
======================================== */

export const fetchManualEntries =
  async () => {

    const data =
      await apiClient.get(
        API_URL
      )

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