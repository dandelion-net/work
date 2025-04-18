import { z } from "zod";

import { PersonaSchema } from "../../../types/persona";

export const chatSchema = z.object({
  message: z.string(),
  persona: PersonaSchema,
});

export const voteSchema = z.object({
  context: z.string().optional(),
  persona: PersonaSchema,
  topic: z.string(),
});
