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
    logoSrc: 'https://img.icons8.com/ios-filled/50/cursor-ai.png',
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
    logoSrc: 'https://img.icons8.com/ios-filled/50/github.png',
    plans: [
      { label: 'Individual', pricePerSeat: 10 },
      { label: 'Business', pricePerSeat: 19 },
      { label: 'Enterprise', pricePerSeat: 39 },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    logoSrc: 'https://img.icons8.com/ios-filled/50/claude-ai.png',
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
    logoSrc: 'https://img.icons8.com/ios/50/chatgpt.png',
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
    logoSrc: 'https://img.icons8.com/ios-filled/50/claude-ai.png',
    plans: [
      { label: 'Pay-as-you-go', pricePerSeat: 0 },
    ],
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    logoSrc: 'https://img.icons8.com/ios/50/chatgpt.png',
    plans: [
      { label: 'Pay-as-you-go', pricePerSeat: 0 },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    logoSrc: 'https://img.icons8.com/ios-filled/50/google-logo.png',
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
    logoSrc: 'https://img.icons8.com/ios-filled/50/windsurf-editor.png',
    plans: [
      { label: 'Free', pricePerSeat: 0 },
      { label: 'Pro', pricePerSeat: 15 },
      { label: 'Teams', pricePerSeat: 35 },
    ],
  },
];
