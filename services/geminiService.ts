import { GoogleGenAI, Modality } from "@google/genai";

// Helper function to decode base64 string to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper function to decode raw audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

export const generateSpeech = async (text: string, onEnded: () => void): Promise<void> => {
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/·/g, ''); // Strip HTML and syllable dots
  if (!cleanText.trim()) {
    console.log("No text to read.");
    onEnded();
    return;
  }

  if (currentSource) {
    currentSource.stop();
    currentSource = null;
  }
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  }

  try {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this clearly: ${cleanText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        onEnded();
        currentSource = null;
      };
      source.start();
      currentSource = source;
    } else {
      throw new Error("No audio data received from API.");
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    alert("Sorry, there was an error generating the speech. Please check the console for details.");
    onEnded();
  }
};

export const stopSpeech = () => {
    if (currentSource) {
        currentSource.stop();
        currentSource = null;
    }
};


export const processTextWithSyllables = async (text: string): Promise<string> => {
  if (!text.trim()) return text;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a helpful assistant for dyslexic readers. Your task is to process the following text by inserting a middle dot (·) between syllables in each word. Do not change punctuation, capitalization, or spacing. For example, 'This is an important document' becomes 'This is an im·por·tant doc·u·ment'. Process this text:\n\n${text}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error processing text for syllables:", error);
    // Return original text on error so the user experience isn't broken
    return text;
  }
};
