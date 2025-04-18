import { Step } from "@mastra/core";

import { agents } from "../../../agents";

export const askFirstPersonaStep = new Step({
  execute: async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!context?.triggerData?.topic) {
      throw new Error("Topic not found in trigger data");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!context?.triggerData?.id1) {
      throw new Error("FirstPersona not found in trigger data");
    }
    const result = await agents.personaAgent.generate(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `Using persona ${context?.triggerData?.id1}, tell me your thoughts on ${context.triggerData.topic}`,
    );
    console.log("askPersona result", result.text);
    return {
      answer: result.text,
    };
  },
  id: "askFirstPersonaStep",
});
