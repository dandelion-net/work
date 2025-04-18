import { createVertex, GoogleVertexProvider } from "@ai-sdk/google-vertex";

import { ValidVertexModels } from "./types";

export let llmProvider: GoogleVertexProvider;

export const getLlmModel = (modelId?: ValidVertexModels) => {
  const env = process.env;
  if (!llmProvider) {
    llmProvider = createVertex({
      googleAuthOptions: {
        credentials: {
          client_email: env.GOOGLE_VERTEX_CLIENT_EMAIL,
          private_key: env.GOOGLE_VERTEX_PRIVATE_KEY,
        },
      },
      location: env.GOOGLE_VERTEX_LOCATION,
      project: env.GOOGLE_VERTEX_PROJECT,
    });
  }
  console.log(llmProvider);
  return llmProvider(
    modelId || (env.GOOGLE_VERTEX_DEFAULT_MODEL as ValidVertexModels),
  );
};
