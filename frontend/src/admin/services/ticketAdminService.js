import {
  API_CONFIG,
} from "../../config/sqlVariables"

const BASE =
  API_CONFIG.BASE_URL

const getTickets =
  async ({
    search = "",
    limit = 50,
  } = {}) => {

    const response =
      await fetch(
        `${BASE}/tickets?search=${search}&limit=${limit}`
      )

    if (!response.ok) {
      throw new Error(
        "Failed to fetch tickets"
      )
    }

    return response.json()
  }

const deleteTicket =
  async (
    ticketNumber
  ) => {

    const response =
      await fetch(
        `${BASE}/tickets/${ticketNumber}`,
        {
          method: "DELETE",
        }
      )

    if (!response.ok) {
      throw new Error(
        "Failed to delete ticket"
      )
    }

    return response.json()
  }

const ticketAdminService = {
  getTickets,
  deleteTicket,
}

export default ticketAdminService