import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateDJScript(context: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a smooth, minimalistic AI radio DJ for "Nothing Radio". 
    Context: ${context}
    Write a short, engaging radio interstitial (max 30 words). 
    Keep it technical but human, in the style of Nothing (minimalistic, precise).
    Example: "[STATIC] You're listening to Nothing Radio. Up next, a track to help you focus. Pure audio, no noise."`,
  });

  return response.text?.trim() || "You're listening to Nothing Radio.";
}

export async function generateDJVoice(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say with a calm, smooth, professional radio voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' }, // Charon for a deep male voice or Kore for female
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("DJ Voice Error:", error);
    return null;
  }
}
