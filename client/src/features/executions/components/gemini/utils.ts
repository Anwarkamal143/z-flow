export const GOOGLE_GENERATIVE_AI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-live-001',
  'gemini-2.0-flash-lite',
  'gemini-2.0-pro-exp-02-05',
  'gemini-2.0-flash-thinking-exp-01-21',
  'gemini-2.0-flash-exp',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-image-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-3-pro-preview',
  'gemini-3-pro-image-preview',
  'gemini-3-flash-preview',
  'gemini-pro-latest',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-pro-exp-03-25',
  'gemini-exp-1206',
  'gemma-3-12b-it',
  'gemma-3-27b-it',
] as const
export type GoogleGenerativeAIModelId =
  | (typeof GOOGLE_GENERATIVE_AI_MODELS)[number]
  | (string & {})
