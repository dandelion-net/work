import { Memory } from "@mastra/memory";

export const memory = new Memory({
  options: {
    lastMessages: 5, // Only keep recent context
    workingMemory: {
      enabled: true, // enables working memory
    },
  },
});
