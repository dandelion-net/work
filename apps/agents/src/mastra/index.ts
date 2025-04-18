import { Mastra } from "@mastra/core";
import { createLogger } from "@mastra/core/logger";

// import { weatherWorkflow } from './workflows';
import { agents } from "./agents";
import { multiPersonaConversation } from "./workflows/multiPersonaConversation";

export const mastra = new Mastra({
  agents,
  logger: createLogger({
    level: "info",
    name: "Mastra",
  }),
  // server: {
  //   port: process.env.PORT || 4111,
  //   timeout: 10000, // Defaults to 5000 (5s)
  // },
  workflows: {
    multiPersonaConversation,
  },
});
