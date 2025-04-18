import { Agent } from "@mastra/core";
import { AgentConfig } from "@mastra/core/agent";

import * as personaAgent from "./persona";

export const agents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personaAgent: new Agent(personaAgent as unknown as AgentConfig<any>),
};
