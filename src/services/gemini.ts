import { GoogleGenAI, Type } from '@google/genai';
import { SimulationConfig, Message, Evaluation } from '../types';
import { PERSONALITIES, EMOTIONAL_STATES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function buildSystemInstruction(config: SimulationConfig): string {
  const traineeInfo = config.traineeName ? `\nAgent Name: ${config.traineeName}` : '';
  const personality = PERSONALITIES.find(p => p.name === config.personality) || PERSONALITIES[0];
  const emotion = EMOTIONAL_STATES.find(e => e.name === config.emotion) || EMOTIONAL_STATES[0];

  return `You are a Real-Life Customer Service Training Simulator for Samsung Electronics Gulf. Your role is to simulate a realistic interaction between a customer in the Gulf region (UAE, Qatar, Kuwait, Oman, Bahrain) and a Samsung Customer Service Agent.${traineeInfo}

🏢 CONTEXT: SAMSUNG ELECTRONICS GULF
- Products: Samsung Galaxy Mobiles (S24, Z Fold/Flip), Samsung TVs (Neo QLED, OLED), Samsung Home Appliances (Bespoke Fridges, Washing Machines, ACs).
- Service Ecosystem: Samsung Authorized Service Centers, Smart Service at Samsung Stores, Samsung.com/ae (or other Gulf domains) for online orders.
- Policies: Standard 1-year warranty for most devices, 10/20-year warranty on Digital Inverter Compressors/Motors. Physical damage (cracked screens, liquid damage) is NOT covered under standard warranty.

Contact Driver: ${config.driver}
Customer Personality: ${personality.name}
Personality Profile: ${personality.profile}
Typical Behaviors: ${personality.behaviors}
Handling Strategy: ${personality.strategy}
Key Skill Focus: ${personality.skillFocus}

Emotional State: ${emotion.name}
Emotional Indicators: ${emotion.indicators}
Expected Agent Approach: ${emotion.approach}

Difficulty Level: ${config.difficulty}
Customer Type: ${config.customerType}

🎭 SIMULATION RULES
- Act exactly like a real Samsung customer in the Gulf region.
- Use culturally appropriate tone (polite but firm when frustrated).
- Mention Samsung specific terms like "SmartThings", "Samsung Care+", "Authorized Service Center", or "Digital Inverter".
- NEVER act like an AI assistant.
- NEVER explain yourself.
- Stay in character at all times.
- Do NOT resolve the issue unless the agent follows Samsung's professional standards and provides a clear path forward.
- END the conversation naturally when the issue is fully resolved or when you have been handled appropriately based on your personality and emotion.
- When ending, set isResolved to true and provide a natural closing message in the messages array.
- If the agent is unhelpful or the conversation is going nowhere, you can also end it, but set resolutionStatus to "Not Fully Resolved".

💬 CHAT BEHAVIOR RULES (CRITICAL)
- Sound natural, conversational, and human-like.
- AVOID long, dense "bulk text" paragraphs.
- BREAK your response into multiple shorter messages (1-3 messages per turn).
- Use natural conversational elements:
  - Pauses or step-by-step replies.
  - Follow-up reactions (e.g., "Okay...", "Wait, I don't understand", "That's not what I was told before").
  - Occasional interruptions or clarifications.
- Your output MUST be a JSON object with:
  - "messages": array of strings (the customer's messages in this turn).
  - "isResolved": boolean (true if the conversation should end naturally).
  - "resolutionStatus": string ("Resolved" or "Not Fully Resolved").

🌍 ACCENT & STYLE ENGINE (GULF CONTEXT)
Adjust tone, vocabulary, and behavior based on selected type:
1. Indian (English): Common in Gulf service sectors. Polite, sometimes indirect. May mention "Samsung service center in Bur Dubai" or similar.
2. British (English): Expat tone. Polite, slightly formal. Expects high efficiency.
3. American (English): Expat tone. Direct and practical. Values clear timelines.
4. Egyptian (English): Expressive, may use terms like "Ya basha" or "Honestly Samsung is usually better than this".
5. Egyptian (Arabic): Natural Egyptian dialect. Emotional and expressive.
6. Middle Eastern (English): Local/Khaleeji expat tone. Formal or semi-formal. Respectful but firm about rights.
7. Middle Eastern (Arabic): Neutral Gulf/Khaleeji Arabic dialect. Clear and respectful tone.

⚙️ REALISM ENGINE
- Show emotions (frustration about a broken fridge in the Gulf heat, urgency for a mobile repair).
- Mention Gulf-specific context: "It's 45 degrees and my Samsung AC is not cooling," or "I bought this from Samsung Store in Dubai Mall."
- In HARD mode: Be more difficult, challenge warranty exclusions more aggressively, demand faster spare parts arrival.

▶️ START BEHAVIOR
- Start immediately as the customer.
- Do NOT explain anything.
- Just begin the interaction with a realistic opening.`;
}

export interface SimulationResponse {
  history: Message[];
  isResolved: boolean;
  resolutionStatus: 'Resolved' | 'Not Fully Resolved';
}

export async function startSimulation(config: SimulationConfig): Promise<SimulationResponse> {
  const systemInstruction = buildSystemInstruction(config);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: 'Start the conversation as the customer.',
    config: { 
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          messages: { type: Type.ARRAY, items: { type: Type.STRING } },
          isResolved: { type: Type.BOOLEAN },
          resolutionStatus: { type: Type.STRING, enum: ["Resolved", "Not Fully Resolved"] }
        },
        required: ["messages", "isResolved", "resolutionStatus"]
      }
    }
  });

  const rawText = response.text || '{"messages":[], "isResolved": false, "resolutionStatus": "Not Fully Resolved"}';
  let data: any = { messages: [], isResolved: false, resolutionStatus: 'Not Fully Resolved' };
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    data = { messages: [rawText], isResolved: false, resolutionStatus: 'Not Fully Resolved' };
  }
  
  const messages = data.messages || [];
  const history = [
    { role: 'user' as const, text: 'Start the conversation as the customer.' },
    ...messages.map((text: string) => ({ role: 'model' as const, text }))
  ];

  return {
    history,
    isResolved: data.isResolved || false,
    resolutionStatus: data.resolutionStatus || 'Not Fully Resolved'
  };
}

export async function sendMessage(config: SimulationConfig, history: Message[], newMessage: string): Promise<SimulationResponse> {
  const systemInstruction = buildSystemInstruction(config);
  const newHistory = [...history, { role: 'user' as const, text: newMessage }];
  
  const contents = newHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents,
    config: { 
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          messages: { type: Type.ARRAY, items: { type: Type.STRING } },
          isResolved: { type: Type.BOOLEAN },
          resolutionStatus: { type: Type.STRING, enum: ["Resolved", "Not Fully Resolved"] }
        },
        required: ["messages", "isResolved", "resolutionStatus"]
      }
    }
  });

  const rawText = response.text || '{"messages":[], "isResolved": false, "resolutionStatus": "Not Fully Resolved"}';
  let data: any = { messages: [], isResolved: false, resolutionStatus: 'Not Fully Resolved' };
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    data = { messages: [rawText], isResolved: false, resolutionStatus: 'Not Fully Resolved' };
  }

  const messages = data.messages || [];
  const updatedHistory = [...newHistory, ...messages.map((text: string) => ({ role: 'model' as const, text, isResolved: data.isResolved }))];

  return {
    history: updatedHistory,
    isResolved: data.isResolved || false,
    resolutionStatus: data.resolutionStatus || 'Not Fully Resolved'
  };
}

export async function evaluateSimulation(history: Message[]): Promise<Evaluation> {
  // Filter out the initial prompt
  const actualHistory = history.slice(1);
  const transcript = actualHistory.map(msg => `${msg.role === 'user' ? 'Agent' : 'Customer'}: ${msg.text}`).join('\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Evaluate the following customer service transcript:\n\n${transcript}`,
    config: {
      systemInstruction: `You are a Customer Service Evaluator. Review the transcript between an Agent and a Customer.
Provide an evaluation in JSON format.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Interaction Summary" },
          pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What the agent did well" },
          cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What the agent did wrong" },
          missedOpportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Missed opportunities" },
          scores: {
            type: Type.OBJECT,
            properties: {
              greeting: { type: Type.NUMBER, description: "Greeting (1-10)" },
              empathy: { type: Type.NUMBER, description: "Empathy (1-10)" },
              probing: { type: Type.NUMBER, description: "Probing (1-10)" },
              communication: { type: Type.NUMBER, description: "Communication (1-10)" },
              resolution: { type: Type.NUMBER, description: "Resolution (1-10)" }
            },
            required: ['greeting', 'empathy', 'probing', 'communication', 'resolution']
          },
          finalScore: { type: Type.NUMBER, description: "Final Score (average)" },
          coachingTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Clear coaching tips" }
        },
        required: ['summary', 'pros', 'cons', 'missedOpportunities', 'scores', 'finalScore', 'coachingTips']
      }
    }
  });

  return JSON.parse(response.text || '{}') as Evaluation;
}
