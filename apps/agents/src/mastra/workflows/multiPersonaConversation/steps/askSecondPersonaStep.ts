import { Step } from "@mastra/core";

import { agents } from "../../../agents";

export const askSecondPersonaStep = new Step({
  execute: async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!context?.triggerData?.id2) {
      throw new Error("SecondPersona not found in trigger data");
    }
    const answer = context?.getStepResult<{ answer: string }>(
      "askFirstPersonaStep",
    )?.answer;

    const result = await agents.personaAgent.generate(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `Using persona ${context?.triggerData?.id2}, respond to the first persona's answer to the following topic: ${context.triggerData.topic}. The first persona's answer is: ${answer}`,
    );
    console.log("askPersona result", result.text);
    return {
      answer: result.text,
    };
  },
  id: "askSecondPersonaStep",
});
