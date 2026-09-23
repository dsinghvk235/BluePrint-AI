/** Turn raw backend / network errors into short, actionable UI copy. */
export function formatGenerationError(raw: string): string {
  const text = raw.toLowerCase()

  if (text.includes('insufficient_quota') || text.includes('exceeded your current quota')) {
    return 'Your AI provider has no remaining quota. For Gemini, check usage at ai.dev/rate-limit or enable billing. For OpenAI, add credits at platform.openai.com.'
  }

  if (text.includes('invalid_api_key') || text.includes('incorrect api key')) {
    return 'Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file.'
  }

  if (text.includes('401') && text.includes('unauthorized')) {
    return 'Session expired. Sign in again and retry.'
  }

  if (text.includes('404') && text.includes('not found')) {
    return 'AI provider endpoint not found. Set OPENAI_BASE_URL=https://api.openai.com/v1 in .env and restart the backend.'
  }

  if (text.includes('429') && text.includes('too many requests')) {
    return 'OpenAI rate limit hit. Wait a minute and try again.'
  }

  if (
    text.includes('failed to fetch') ||
    text.includes('network error') ||
    text.includes('aborted')
  ) {
    return 'Cannot reach the backend. Confirm it is running on port 8080.'
  }

  if (text.includes('connection refused') || text.includes('ollama unavailable')) {
    return 'Ollama is not running. Install from ollama.com, run `ollama serve`, then `ollama pull llama3.2`.'
  }

  if (raw.length > 220) {
    return `${raw.slice(0, 220)}…`
  }

  return raw
}
