import {
  API_ENDPOINTS,
  buildApiUrl,
} from "../../config/sqlVariables"

/*
  TICKET SERVICE

  FUTURE SAFE:
  - SQL Server
  - AI summarization
  - escalation
  - analytics
  - admin dashboard
  - SLA systems
*/

/* CREATE */
const createTicket =
  async ({
    SessionID,

    RequesterUserID,

    ChatTitle,

    IssueSummary,

    Description,

    PriorityLevel,

    CategoryName,
  }) => {

    const payload = {
      SessionID,

      RequesterUserID,

      ChatTitle,

      IssueSummary,

      Description,

      PriorityLevel,

      CategoryName,

      CreatedAt:
        new Date().toISOString(),
    }

    console.log(
      "CREATE_TICKET_PAYLOAD",
      payload
    )

    console.log(
      "API_ENDPOINT",
      buildApiUrl(
        API_ENDPOINTS.TICKET_CREATE
      )
    )

    /*
      FUTURE:
      return await fetch(...)
    */

    return {
      success: true,

      RelatedTicketID:
        "TICKET_ID_PLACEHOLDER",

      payload,
    }
  }

/* LOAD */
const loadTicket =
  async (RelatedTicketID) => {

    console.log(
      "LOAD_TICKET",
      {
        RelatedTicketID,
      }
    )

    console.log(
      "API_ENDPOINT",
      buildApiUrl(
        API_ENDPOINTS.TICKETS
      )
    )

    return {
      success: true,

      ticket: null,
    }
  }

/* UPDATE */
const updateTicket =
  async ({
    RelatedTicketID,

    TicketStatus,

    ResolutionSummary,
  }) => {

    const payload = {
      RelatedTicketID,

      TicketStatus,

      ResolutionSummary,

      UpdatedAt:
        new Date().toISOString(),
    }

    console.log(
      "UPDATE_TICKET_PAYLOAD",
      payload
    )

    console.log(
      "API_ENDPOINT",
      buildApiUrl(
        API_ENDPOINTS.TICKET_UPDATE,
        {
          id:
            RelatedTicketID,
        }
      )
    )

    return {
      success: true,

      payload,
    }
  }

/* RESOLVE */
const resolveTicket =
  async ({
    RelatedTicketID,

    ResolutionSummary,
  }) => {

    const payload = {
      RelatedTicketID,

      ResolutionSummary,

      ResolvedAt:
        new Date().toISOString(),
    }

    console.log(
      "RESOLVE_TICKET_PAYLOAD",
      payload
    )

    return {
      success: true,

      payload,
    }
  }

const ticketService = {
  createTicket,

  loadTicket,

  updateTicket,

  resolveTicket,
}

export default ticketService