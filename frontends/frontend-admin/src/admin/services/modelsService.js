import apiClient from "../../shared/api/client"
import API_ENDPOINTS from "../../shared/api/endpoints"

/**
 * Service for fetching available LLM models from the backend.
 */
const modelsService = {
  /**
   * Fetches the list of available Groq models.
   * @returns {Promise<Array>} List of models with { id, name }
   */
  getGroqModels: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MODELS_GROQ)
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error("Failed to fetch Groq models:", error)
      return []
    }
  },
}

export default modelsService
