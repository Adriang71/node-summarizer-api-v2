export interface PromptTemplate {
  id: string;
  name: string;
  language: string;
  systemPrompt: string;
  userPromptTemplate: string;
  description: string;
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  'analysis-en': {
    id: 'analysis-en',
    name: 'Content Analysis (English)',
    language: 'en',
    systemPrompt: `You are an expert in analyzing web content. Your task is to analyze the provided website and present it in a concise and useful manner. Always respond in English.`,
    userPromptTemplate: `Analyze the following website:

Title: {title}
URL: {url}

Page content:
{content}

Please provide analysis in the following JSON format:

{
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "summary": "Brief summary of the page (10 sentences)",
  "sentiment": "positive|negative|neutral",
  "wordCount": number_of_words_in_content
}

The analysis should be objective and useful. Key points should contain the most important information from the page.`,
    description: 'Standard content analysis prompt in English'
  },
  'analysis-pl': {
    id: 'analysis-pl',
    name: 'Content Analysis (Polish)',
    language: 'pl',
    systemPrompt: `Jesteś ekspertem w analizie treści internetowych. Twoim zadaniem jest przeanalizowanie podanej strony internetowej i przedstawienie jej w zwięzły i użyteczny sposób. Zawsze odpowiadaj po polsku.`,
    userPromptTemplate: `Przeanalizuj następującą stronę internetową:

Tytuł: {title}
URL: {url}

Treść strony:
{content}

Proszę podaj analizę w następującym formacie JSON:

{
  "keyPoints": ["Kluczowy punkt 1", "Kluczowy punkt 2", "Kluczowy punkt 3"],
  "summary": "Krótkie podsumowanie strony (10 zdań)",
  "sentiment": "positive|negative|neutral",
  "wordCount": liczba_słów_w_treści
}

Analiza powinna być obiektywna i użyteczna. Kluczowe punkty powinny zawierać najważniejsze informacje ze strony.`,
    description: 'Standard content analysis prompt in Polish'
  },
};

export const DEFAULT_PROMPT = 'analysis-en';

export function getPrompt(promptId?: string): PromptTemplate {
  const id = promptId || DEFAULT_PROMPT;
  const prompt = PROMPT_TEMPLATES[id];
  
  if (!prompt) {
    throw new Error(`Prompt '${id}' not found. Available prompts: ${Object.keys(PROMPT_TEMPLATES).join(', ')}`);
  }
  
  return prompt;
}

export function getPromptsByLanguage(language: string): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES).filter(prompt => prompt.language === language);
}

export function getAvailablePrompts(): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES);
}

export function formatPrompt(template: PromptTemplate, variables: Record<string, string>): string {
  let formatted = template.userPromptTemplate;
  
  for (const [key, value] of Object.entries(variables)) {
    formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  
  return formatted;
} 