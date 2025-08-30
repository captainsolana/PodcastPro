import OpenAI from "openai";
import fs from "fs";
import path from "path";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-test-key"
});

export interface PromptRefinementResult {
  refinedPrompt: string;
  focusAreas: string[];
  suggestedDuration: number;
  targetAudience: string;
}

export interface ResearchResult {
  sources: Array<{ title: string; url: string; summary: string }>;
  keyPoints: string[];
  statistics: Array<{ fact: string; source: string }>;
  outline: string[];
}

export interface ScriptResult {
  content: string;
  sections: Array<{ type: string; content: string; duration: number }>;
  totalDuration: number;
  analytics: {
    wordCount: number;
    readingTime: number;
    speechTime: number;
    pauseCount: number;
  };
}

export class OpenAIService {
  async refinePrompt(originalPrompt: string): Promise<PromptRefinementResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "You are a podcast creation expert. Refine user prompts to create engaging 15-20 minute podcast episodes. Focus on making topics accessible, engaging, and well-structured. Respond with JSON."
          },
          {
            role: "user",
            content: `Refine this podcast idea and provide structure: "${originalPrompt}". Include refined prompt, focus areas, suggested duration, and target audience in JSON format: { "refinedPrompt": string, "focusAreas": string[], "suggestedDuration": number, "targetAudience": string }`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Failed to refine prompt: ${(error as Error).message}`);
    }
  }

  async conductResearch(refinedPrompt: string): Promise<ResearchResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", // using GPT-5 for research as it has the most up-to-date knowledge
        messages: [
          {
            role: "system",
            content: "You are a deep research specialist. Conduct comprehensive research on topics for podcast creation. Provide credible sources, key statistics, and compelling insights."
          },
          {
            role: "user",
            content: `Conduct in-depth research for this podcast topic: "${refinedPrompt}". Provide research data in JSON format: { "sources": [{"title": string, "url": string, "summary": string}], "keyPoints": string[], "statistics": [{"fact": string, "source": string}], "outline": string[] }`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Failed to conduct research: ${(error as Error).message}`);
    }
  }

  async generateScript(prompt: string, research: ResearchResult): Promise<ScriptResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "You are an expert podcast script writer. Create engaging 15-20 minute scripts with natural conversation flow, including pauses, fillers, and transitions. Make content accessible and compelling."
          },
          {
            role: "user",
            content: `Create a podcast script for: "${prompt}". Use this research: ${JSON.stringify(research)}. Include natural conversation elements like [pause], [thoughtful pause], [emphasis], etc. Format as JSON: { "content": string, "sections": [{"type": string, "content": string, "duration": number}], "totalDuration": number, "analytics": {"wordCount": number, "readingTime": number, "speechTime": number, "pauseCount": number} }`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Failed to generate script: ${(error as Error).message}`);
    }
  }

  async generateAudio(scriptContent: string, voiceSettings: { model: string; speed: number }): Promise<{ audioUrl: string; duration: number }> {
    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova", // Using nova as coral is not available, nova has similar characteristics
        input: scriptContent,
        speed: voiceSettings.speed,
      });

      // Save audio file
      const audioDir = path.join(process.cwd(), "public", "audio");
      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const fileName = `podcast_${Date.now()}.mp3`;
      const filePath = path.join(audioDir, fileName);
      const buffer = Buffer.from(await mp3.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Estimate duration (rough calculation: ~150 words per minute)
      const wordCount = scriptContent.split(/\s+/).length;
      const estimatedDuration = Math.round((wordCount / 150) * 60); // in seconds

      return {
        audioUrl: `/audio/${fileName}`,
        duration: estimatedDuration
      };
    } catch (error) {
      throw new Error(`Failed to generate audio: ${(error as Error).message}`);
    }
  }

  async generateScriptSuggestions(scriptContent: string): Promise<Array<{ type: string; suggestion: string; targetSection: string }>> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
        messages: [
          {
            role: "system",
            content: "You are a podcast editing expert. Analyze scripts and provide specific improvement suggestions for flow, engagement, and clarity."
          },
          {
            role: "user",
            content: `Analyze this podcast script and provide improvement suggestions: "${scriptContent}". Format as JSON: { "suggestions": [{"type": string, "suggestion": string, "targetSection": string}] }`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.suggestions || [];
    } catch (error) {
      throw new Error(`Failed to generate suggestions: ${(error as Error).message}`);
    }
  }
}

export const openAIService = new OpenAIService();
