import { GoogleVoice } from "@mastra/voice-google";

const env = process.env;

export const voice = new GoogleVoice({
  listeningModel: {
    apiKey: env.GOOGLE_VOICE_API_KEY,
  },
  speaker: "en-US-Standard-F",
  speechModel: {
    apiKey: env.GOOGLE_VOICE_API_KEY,
  },
});
