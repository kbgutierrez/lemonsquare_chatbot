/**
 * AI Models Configuration
 * Comprehensive list of available AI models for the chatbot
 * Used in the AI Model Dropdown selector in the admin dashboard
 */

export const aiModels = [
  {
    id: 'openai-gpt-oss-120b',
    name: 'openai/gpt-oss-120b',
    description: 'Open-weight flagship reasoning model with strong coding, tool use, and advanced reasoning capabilities.'
  },
  {
    id: 'openai-gpt-oss-20b',
    name: 'openai/gpt-oss-20b',
    description: 'Smaller and faster GPT-OSS model optimized for reasoning and lightweight applications.'
  },
  {
    id: 'openai-gpt-oss-safeguard-20b',
    name: 'openai/gpt-oss-safeguard-20b',
    description: 'Safety-focused variant of GPT-OSS 20B with enhanced content filtering and responsible AI features.'
  },
  {
    id: 'llama-3-3-70b-versatile',
    name: 'llama-3.3-70b-versatile',
    description: 'Versatile 70B model from Meta Llama 3.3 with strong all-around performance across diverse tasks.'
  },
  {
    id: 'llama-3-1-70b-instruct',
    name: 'llama-3.1-70b-instruct',
    description: 'Instruction-tuned 70B model optimized for following detailed instructions and conversation.'
  },
  {
    id: 'llama-3-1-8b-instruct',
    name: 'llama-3.1-8b-instruct',
    description: 'Lightweight 8B instruction-tuned model ideal for edge devices and low-latency applications.'
  },
  {
    id: 'meta-llama-4-scout-17b',
    name: 'meta-llama/llama-4-scout-17b-16e-instruct',
    description: 'Scout variant of Llama 4 with 17B parameters and extended context, optimized for reconnaissance tasks.'
  },
  {
    id: 'meta-llama-4-maverick-17b',
    name: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    description: 'Maverick variant of Llama 4 with extended 128k token context window for long-document processing.'
  },
  {
    id: 'qwen-qwen3-32b',
    name: 'qwen/qwen3-32b',
    description: 'Alibaba Qwen3 32B model with multilingual support and strong reasoning capabilities.'
  },
  {
    id: 'mixtral-8x7b-instruct',
    name: 'mixtral-8x7b-instruct',
    description: 'Mixture of Experts model combining 8 expert networks for efficient and capable inference.'
  },
  {
    id: 'gemma2-9b-it',
    name: 'gemma2-9b-it',
    description: 'Google Gemma 2 9B model with instruction-tuning for improved instruction-following capabilities.'
  },
  {
    id: 'gemma-7b-it',
    name: 'gemma-7b-it',
    description: 'Compact Google Gemma 7B model with instruction-tuning for efficient deployment.'
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'deepseek-r1-distill-llama-70b',
    description: 'DeepSeek R1 reasoning model distilled for Llama architecture with 70B parameters.'
  },
  {
    id: 'deepseek-r1-distill-qwen-32b',
    name: 'deepseek-r1-distill-qwen-32b',
    description: 'DeepSeek R1 reasoning model distilled for Qwen architecture with 32B parameters.'
  },
  {
    id: 'whisper-large-v3',
    name: 'whisper-large-v3',
    description: 'OpenAI Whisper large speech-to-text model with multilingual support and improved accuracy.'
  },
  {
    id: 'whisper-large-v3-turbo',
    name: 'whisper-large-v3-turbo',
    description: 'Optimized fast variant of Whisper large for real-time speech transcription.'
  },
  {
    id: 'playai-tts',
    name: 'playai-tts',
    description: 'PlayAI text-to-speech model with natural voice generation and emotional expression.'
  },
  {
    id: 'moonshotai-kimi-k2-instruct',
    name: 'moonshotai/kimi-k2-instruct',
    description: 'Moonshot AI Kimi K2 model with instruction-following and long-context capabilities.'
  },
  {
    id: 'allam-2-7b',
    name: 'allam-2-7b',
    description: 'Allam 2 7B Arabic and English language model with strong multilingual performance.'
  }
]
