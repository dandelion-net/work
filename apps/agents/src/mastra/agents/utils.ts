import zodToJsonSchema from "zod-to-json-schema";

import { agents } from ".";
import {
  PersonaPrompt,
  personaPrompts,
  PersonaPromptSchema,
} from "../../fixtures/personaPrompts";
import { Persona, PersonaSchema } from "../../types/persona";


// export const getPersona = async (random?: boolean): Promise<string> => {
//   const personaPromptIndex = Math.floor(Math.random() * personaPrompts.length);
//   let personaPrompt: PersonaPrompt | string =
//     personaPrompts[personaPromptIndex];
//   if (random) {
//     const promptJsonSchema = zodToJsonSchema(PersonaPromptSchema);
//     const promptStringifiedSchema = JSON.stringify(promptJsonSchema);
//     const personaPromptResponse =
//       await agents.personaPromptGeneratorAgent.generate(
//         `Generate a random persona prompt. Do not provide commentary or inference background, only provide the json result. The schema is: ${promptStringifiedSchema}`,
//       );
//     personaPrompt = personaPromptResponse.text;
//   }
//   const personaJsonSchema = zodToJsonSchema(PersonaSchema);
//   const personaStringifiedSchema = JSON.stringify(personaJsonSchema);
//   const persona = await agents.personaGeneratorAgent.generate(
//     `Generate a persona based on the following prompt: ${JSON.stringify(personaPrompt)}. Do not provide commentary or inference background, only provide the json result. The schema is: ${personaStringifiedSchema}`,
//   );
//   return persona.text;
// };
