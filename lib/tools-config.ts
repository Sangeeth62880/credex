export interface ToolDefinition {
  id: string;
  name: string;
  logoSrc: string;
  plans: Array<{ label: string; pricePerSeat: number }>;
}

export const TOOLS: ToolDefinition[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    logoSrc: '/logos/cursor.svg',
    plans: [
      { label: 'Hobby', pricePerSeat: 0 },
      { label: 'Pro', pricePerSeat: 20 },
      { label: 'Business', pricePerSeat: 40 },
      { label: 'Enterprise', pricePerSeat: 0 },
    ],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    logoSrc: '/logos/github.svg',
    plans: [
      { label: 'Individual', pricePerSeat: 10 },
      { label: 'Business', pricePerSeat: 19 },
      { label: 'Enterprise', pricePerSeat: 39 },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    logoSrc: '/logos/claude.svg',
    plans: [
      { label: 'Free', pricePerSeat: 0 },
      { label: 'Pro', pricePerSeat: 20 },
      { label: 'Max', pricePerSeat: 100 },
      { label: 'Team', pricePerSeat: 30 },
      { label: 'Enterprise', pricePerSeat: 0 },
      { label: 'API Direct', pricePerSeat: 0 },
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    logoSrc: '/logos/openai.svg',
    plans: [
      { label: 'Plus', pricePerSeat: 20 },
      { label: 'Team', pricePerSeat: 30 },
      { label: 'Enterprise', pricePerSeat: 0 },
      { label: 'API Direct', pricePerSeat: 0 },
    ],
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    logoSrc: '/logos/anthropic.svg',
    plans: [
      { label: 'Pay-as-you-go', pricePerSeat: 0 },
    ],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    logoSrc: '/logos/openai.svg',
    plans: [
      { label: 'Pay-as-you-go', pricePerSeat: 0 },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    logoSrc: '/logos/google.svg',
    plans: [
      { label: 'Free', pricePerSeat: 0 },
      { label: 'Advanced', pricePerSeat: 20 },
      { label: 'Business', pricePerSeat: 22 },
      { label: 'API Direct', pricePerSeat: 0 },
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    logoSrc: '/logos/windsurf.svg',
    plans: [
      { label: 'Free', pricePerSeat: 0 },
      { label: 'Pro', pricePerSeat: 15 },
      { label: 'Teams', pricePerSeat: 35 },
    ],
  },
];
