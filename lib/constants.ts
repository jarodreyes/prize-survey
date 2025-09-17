// Fun questions for the survey
export const FUN_QUESTIONS = [
  {
    id: 'editor',
    question: 'Favorite code editor?',
    options: ['VS Code', 'Neovim', 'JetBrains', 'Other']
  },
  {
    id: 'indentation',
    question: 'Tabs or spaces?',
    options: ['Tabs', 'Spaces']
  },
  {
    id: 'darkmode',
    question: 'Dark mode preference?',
    options: ['Always', 'Sometimes', 'Never']
  }
] as const

// Lead generation field options
export const LLM_OPTIONS = [
  'GPT-4o (multi-modal)',
  'GPT-5',
  'GPT-4 Classic',
  'Claude 3 Opus',
  'Claude 3 Haiku',
  'Claude Ultra',
  'Claude 4-sonnet',
  'Llama 3',
  'Vicuna',
  'Mistral',
  'Mixtral',
  'Anthropic’s Redwood',
  'Google Gemini',
  'OpenAI’s GPT-3.5',
  'OpenAI’s GPT-3',
  'Other'
] as const

export const FRAMEWORK_OPTIONS = [
  'React',
  'Next.js',
  'Vue',
  'Svelte',
  'Angular',
  'Other'
] as const

// Prize thresholds and details
export const PRIZE_TIERS = [
  {
    id: 'tier1',
    threshold: 15,
    title: 'Foods of Seattle Pouch',
    description: 'First milestone!',
    image: '/images/prizes/pouch-prize.jpg'
  },
  {
    id: 'tier2', 
    threshold: 25,
    title: 'Sub Pop Beanie',
    description: 'Building momentum!',
    image: '/images/prizes/beanie.webp'
  },
  {
    id: 'tier3',
    threshold: 50,
    title: 'Kurt Cobain Shirt',
    description: 'Halfway there!',
    image: '/images/prizes/kurt-prize.jpg'
  },
  {
    id: 'tier4',
    threshold: 100,
    title: 'AudioBox Casette Player/Recorder',
    description: 'Ultimate achievement unlocked!',
    image: '/images/prizes/boombox-prize.jpg'
  }
] as const

// Rate limiting - simple in-memory token bucket
export const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
} as const
