import { Workflow } from "@mastra/core/workflows";
import { z } from "zod";

import { askFirstPersonaStep } from "./steps/askFirstPersonaStep";
import { askSecondPersonaStep } from "./steps/askSecondPersonaStep";

export const multiPersonaConversation = new Workflow({
  name: "multi-persona-conversation",
  triggerSchema: z.object({
    id1: z.string(),
    id2: z.string(),
    topic: z.string(),
  }),
  // steps: [
  //   askFirstPersonaStep, askSecondPersonaStep
  // ],
})
  .step(askFirstPersonaStep)
  .then(askSecondPersonaStep);

multiPersonaConversation.commit();
