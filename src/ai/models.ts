export interface AIModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  temperature: number;
  costPerToken?: number;
  description: string;
}

export const AI_MODELS: Record<string, AIModel> = {
  'llama-3-70b': {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    provider: 'Meta',
    maxTokens: 8000,
    temperature: 0.3,
    description: 'Large multilingual model with good Polish support (Free)'
  },
  'mistral-7b': {
    id: 'mistralai/mistral-7b-instruct',
    name: 'Mistral 7B',
    provider: 'Mistral AI',
    maxTokens: 8000,
    temperature: 0.3,
    description: 'Multilingual model with good Polish language capabilities (Free)'
  },
  'deepseek-chat': {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    maxTokens: 10000,
    temperature: 0.3,
    description: 'Multilingual model with Polish language support (Free)'
  }
};

export const DEFAULT_MODEL = 'deepseek-chat';

export function getModel(modelId?: string): AIModel {
  const id = modelId || DEFAULT_MODEL;
  const model = AI_MODELS[id];
  
  if (!model) {
    throw new Error(`Model '${id}' not found. Available models: ${Object.keys(AI_MODELS).join(', ')}`);
  }
  
  return model;
}

export function getAvailableModels(): AIModel[] {
  return Object.values(AI_MODELS);
} 