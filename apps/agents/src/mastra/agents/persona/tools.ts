import { Tool } from "@mastra/core";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { personas } from "../../../fixtures/personas";
import { PersonaSchema } from "../../../types/persona";
import { generatePersonaContext, getPersona } from "../utils";
import { chatSchema, voteSchema } from "./schemas";
import { voice } from "./voice";

console.log("personas", personas);

export const tools = {
  chat: createTool({
    description: "Chat with the persona about healthcare topics",
    // eslint-disable-next-line @typescript-eslint/require-await
    execute: async ({ context: { message, persona } }) => {
      // console.log("chat with persona", persona);
      const context = generatePersonaContext(persona);

      return `Based on the following context about the persona:

${context}

Respond to this message: ${message}`;
    },
    id: "Chat with Persona",
    inputSchema: chatSchema,
  }),
  getContext: createTool({
    description: "Get the persona's context",
    // eslint-disable-next-line @typescript-eslint/require-await
    execute: async ({ context: persona }) => {
      return generatePersonaContext(persona);
    },
    id: "Get Persona Context",
    inputSchema: PersonaSchema,
  }),

  getPersona: createTool({
    description: "Get the persona's details",
    // eslint-disable-next-line @typescript-eslint/require-await
    execute: async ({ context: { random } }) => {
      return getPersona(random);
    },
    id: "Get Persona",
    inputSchema: z.object({
      random: z.boolean().optional(),
    }),
  }),

  getVoices: createTool({
    description: "What voice profiles can I use?",
    execute: async () => {
      const voices = await voice.getSpeakers();

      return `The following voice profiles are available: ${voices.map((voice) => voice.voiceId).join(", ")}.`;
    },
    id: "Get Voices",
  }),

  vote: createTool({
    description:
      "Evaluate a healthcare policy or topic from the persona's perspective",
    // eslint-disable-next-line @typescript-eslint/require-await
    execute: async ({ context: { context, persona, topic } }) => {
      console.log("vote on topic", topic, context);
      const personaContext = generatePersonaContext(persona);

      return `Based on the following context about the persona:

${personaContext}

Should this persona support or oppose the following topic?

Topic: ${topic}
${context ? `Additional Context: ${context}` : ""}

Respond with either "support" or "oppose" and a brief explanation.`;
    },
    id: "Evaluate Topic",
    inputSchema: voteSchema,
  }),
} as Record<string, Tool>;
