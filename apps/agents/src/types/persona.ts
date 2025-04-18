import { z } from "zod";

export const PersonaSchema = z.object({

  id: z
    .string()
    .optional()
    .describe("Unique identifier for the persona, omit if generating new"),

  name: z.string(),

});

export type Persona = z.infer<typeof PersonaSchema>;

export const ChatMessageSchema = z.object({
  message: z.string(),
  personaId: z.string(),
});

export const TopicVoteSchema = z.object({
  context: z.string().optional(),
  personaId: z.string(),
  topic: z.string(),
});
