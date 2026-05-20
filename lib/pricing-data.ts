/**
 * Pricing data for AI tools supported by the audit engine.
 * Last verified: May 7, 2026
 *
 * This data drives the audit engine's plan-fit checks and
 * cross-tool alternative recommendations.
 */

export type PlanTier = {
  name: string;
  pricePerUser: number;
  minSeats?: number; // minimum seats that make sense for this plan
  maxSeats?: number; // maximum seats before you should upgrade
  features: string[];
};

export const PRICING_VERSION = "2026-05-20";

export type ToolPricing = {
  tool: string;
  category: ("coding" | "writing" | "data" | "research" | "mixed")[];
  plans: PlanTier[];
  apiPricing?: {
    inputPer1MTokens: number;
    outputPer1MTokens: number;
    model: string;
  };
  url: string;
};

export const PRICING_DATA: ToolPricing[] = [
  {
    tool: "Cursor",
    category: ["coding"],
    url: "https://cursor.sh/pricing",
    plans: [
      {
        name: "Hobby",
        pricePerUser: 0,
        features: ["2000 completions", "50 slow premium requests"],
      },
      {
        name: "Pro",
        pricePerUser: 20,
        maxSeats: 10,
        features: ["Unlimited completions", "500 fast premium requests"],
      },
      {
        name: "Business",
        pricePerUser: 40,
        minSeats: 5,
        features: ["Admin dashboard", "Enforced privacy mode", "SSO"],
      },
    ],
  },
  {
    tool: "GitHub Copilot",
    category: ["coding"],
    url: "https://github.com/features/copilot",
    plans: [
      {
        name: "Individual",
        pricePerUser: 10,
        maxSeats: 1,
        features: ["Code completions", "Chat"],
      },
      {
        name: "Business",
        pricePerUser: 19,
        minSeats: 2,
        features: ["Org management", "Policy controls", "IP indemnity"],
      },
      {
        name: "Enterprise",
        pricePerUser: 39,
        minSeats: 10,
        features: ["SAML SSO", "Audit logs", "Fine-tuned models"],
      },
    ],
  },
  {
    tool: "Claude",
    category: ["coding", "writing", "research", "mixed"],
    url: "https://anthropic.com/pricing",
    plans: [
      {
        name: "Free",
        pricePerUser: 0,
        features: ["Limited messages"],
      },
      {
        name: "Pro",
        pricePerUser: 20,
        maxSeats: 1,
        features: ["5x more usage", "Priority access", "Claude 3.5 Sonnet"],
      },
      {
        name: "Max",
        pricePerUser: 100,
        maxSeats: 1,
        features: ["20x more usage", "Extended thinking"],
      },
      {
        name: "Team",
        pricePerUser: 30,
        minSeats: 2,
        features: ["Collaboration", "Admin controls", "Higher limits"],
      },
    ],
  },
  {
    tool: "ChatGPT",
    category: ["writing", "data", "mixed"],
    url: "https://openai.com/chatgpt/pricing",
    plans: [
      {
        name: "Free",
        pricePerUser: 0,
        features: ["Limited GPT-4o"],
      },
      {
        name: "Plus",
        pricePerUser: 20,
        maxSeats: 1,
        features: ["GPT-4o", "DALL-E", "Browsing", "Advanced analysis"],
      },
      {
        name: "Team",
        pricePerUser: 30,
        minSeats: 2,
        features: ["Workspace", "Admin console", "Higher limits"],
      },
    ],
  },
  {
    tool: "Anthropic API",
    category: ["coding", "writing", "data", "research", "mixed"],
    url: "https://anthropic.com/api",
    plans: [
      {
        name: "Usage-Based",
        pricePerUser: 0,
        features: ["Pay per token", "No monthly commitment"],
      },
    ],
    apiPricing: {
      model: "Claude 3.5 Sonnet",
      inputPer1MTokens: 3.0,
      outputPer1MTokens: 15.0,
    },
  },
  {
    tool: "OpenAI API",
    category: ["coding", "writing", "data", "research", "mixed"],
    url: "https://openai.com/pricing",
    plans: [
      {
        name: "Usage-Based",
        pricePerUser: 0,
        features: ["Pay per token", "No monthly commitment"],
      },
    ],
    apiPricing: {
      model: "GPT-4o",
      inputPer1MTokens: 2.5,
      outputPer1MTokens: 10.0,
    },
  },
  {
    tool: "Gemini",
    category: ["writing", "data", "mixed"],
    url: "https://one.google.com/about/plans",
    plans: [
      {
        name: "Free",
        pricePerUser: 0,
        features: ["Limited Gemini access"],
      },
      {
        name: "Pro",
        pricePerUser: 20,
        features: ["Gemini Advanced", "2TB storage", "Google Workspace integration"],
      },
    ],
  },
  {
    tool: "Windsurf",
    category: ["coding"],
    url: "https://windsurf.com/pricing",
    plans: [
      {
        name: "Free",
        pricePerUser: 0,
        features: ["Limited completions and flows"],
      },
      {
        name: "Pro",
        pricePerUser: 15,
        maxSeats: 5,
        features: ["Unlimited flows", "Priority support"],
      },
      {
        name: "Team",
        pricePerUser: 35,
        minSeats: 3,
        features: ["Admin dashboard", "Team management"],
      },
    ],
  },
];
