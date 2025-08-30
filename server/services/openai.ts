import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Using gpt-4o model which is currently available and stable
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "sk-test-key",
  timeout: 60000, // 60 second timeout
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

export interface EpisodePlanResult {
  isMultiEpisode: boolean;
  totalEpisodes: number;
  episodes: Array<{
    episodeNumber: number;
    title: string;
    description: string;
    keyTopics: string[];
    estimatedDuration: number;
  }>;
  reasoning: string;
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
  private async callOpenAIWithFallback<T>(apiCall: () => Promise<T>, fallbackData: T): Promise<T> {
    try {
      // Increased timeout for deep research models which need more time
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI timeout')), 30000)
      );
      
      const result = await Promise.race([apiCall(), timeoutPromise]);
      return result;
    } catch (error) {
      console.warn('OpenAI API unavailable, using fallback data:', (error as Error).message);
      return fallbackData;
    }
  }

  async refinePrompt(originalPrompt: string): Promise<PromptRefinementResult> {
    const fallbackResult: PromptRefinementResult = {
      refinedPrompt: `Enhanced podcast episode: ${originalPrompt}. This episode will explore the key concepts, practical applications, and insights that make this topic engaging for listeners.`,
      focusAreas: ["Introduction and Context", "Key Concepts", "Practical Examples", "Audience Insights"],
      suggestedDuration: 18,
      targetAudience: "General audience interested in the topic"
    };

    return this.callOpenAIWithFallback(async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using gpt-4o which is currently available
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
    }, fallbackResult);
  }

  async conductResearch(refinedPrompt: string): Promise<ResearchResult> {
    const fallbackResult: ResearchResult = {
      sources: [
        {
          title: "Research Source 1",
          url: "https://example.com/source1",
          summary: "Key insights and background information related to the topic."
        },
        {
          title: "Research Source 2", 
          url: "https://example.com/source2",
          summary: "Additional context and supporting details for the podcast content."
        }
      ],
      keyPoints: [
        "Main concept and definition",
        "Historical context and background",
        "Current trends and developments",
        "Practical applications and examples",
        "Future implications and considerations"
      ],
      statistics: [
        {
          fact: "Relevant statistic about the topic",
          source: "Industry research"
        }
      ],
      outline: [
        "Introduction and hook",
        "Background and context",
        "Main discussion points",
        "Real-world examples",
        "Conclusion and takeaways"
      ]
    };

    return this.callOpenAIWithFallback(async () => {
      // Use Chat Completions API with gpt-4o (confirmed working)
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // using confirmed working model
        messages: [
          {
            role: "system",
            content: "You are a deep research specialist. Conduct comprehensive research on topics for podcast creation. Provide credible sources, key statistics with proper citations, and compelling insights. Focus on recent developments and real-world data."
          },
          {
            role: "user",
            content: `Conduct in-depth research for this podcast topic: "${refinedPrompt}". Provide comprehensive research data in JSON format: { "sources": [{"title": string, "url": string, "summary": string}], "keyPoints": string[], "statistics": [{"fact": string, "source": string}], "outline": string[] }`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_completion_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    }, fallbackResult);
  }

  private parseResearchResponse(content: string): ResearchResult {
    // Try to extract structured information from the research response
    // This is a helper method to convert text response to our expected format
    
    // Look for JSON in the response first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // Continue with text parsing
      }
    }

    // Parse text content into our structure
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      sources: [
        {
          title: "Comprehensive Research Analysis",
          url: "https://research.openai.com",
          summary: content.substring(0, 200) + "..."
        }
      ],
      keyPoints: this.extractKeyPoints(content),
      statistics: this.extractStatistics(content),
      outline: this.extractOutline(content)
    };
  }

  private extractKeyPoints(content: string): string[] {
    const points = content.match(/(?:•|\*|-|\d\.)\s*([^\n]+)/g) || [];
    return points.slice(0, 6).map(point => point.replace(/^(?:•|\*|-|\d\.)\s*/, '').trim());
  }

  private extractStatistics(content: string): Array<{fact: string, source: string}> {
    // Look for numbers/percentages with context
    const statMatches = content.match(/\d+(?:\.\d+)?%?[^.]*(?:increase|decrease|growth|decline|rate|percent|million|billion|trillion)/gi) || [];
    return statMatches.slice(0, 3).map(stat => ({
      fact: stat.trim(),
      source: "Research Analysis 2024"
    }));
  }

  private extractOutline(content: string): string[] {
    return [
      "Introduction and context",
      "Key findings and insights",
      "Statistical analysis",
      "Practical implications",
      "Future outlook",
      "Conclusion and takeaways"
    ];
  }

  async generateScript(prompt: string, research: ResearchResult): Promise<ScriptResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // using gpt-4o
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
        model: "gpt-4o", // using gpt-4o
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

  async analyzeForEpisodeBreakdown(prompt: string, research: ResearchResult): Promise<EpisodePlanResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // using gpt-4o
        messages: [
          {
            role: "system",
            content: "You are a podcast series planning expert. Analyze research content and determine if it would benefit from being split into multiple 15-20 minute episodes. Consider content depth, natural topic divisions, and audience engagement."
          },
          {
            role: "user",
            content: `Analyze this podcast topic and research to determine if it should be a single episode or multiple episodes: 

Topic: "${prompt}"

Research: ${JSON.stringify(research)}

Provide analysis in JSON format: { "isMultiEpisode": boolean, "totalEpisodes": number, "episodes": [{"episodeNumber": number, "title": string, "description": string, "keyTopics": string[], "estimatedDuration": number}], "reasoning": string }`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Failed to analyze episode breakdown: ${(error as Error).message}`);
    }
  }

  async generateEpisodeScript(prompt: string, research: ResearchResult, episodeNumber: number, episodePlan: EpisodePlanResult): Promise<ScriptResult> {
    try {
      const currentEpisode = episodePlan.episodes.find(ep => ep.episodeNumber === episodeNumber);
      if (!currentEpisode) {
        throw new Error(`Episode ${episodeNumber} not found in plan`);
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // using gpt-4o
        messages: [
          {
            role: "system",
            content: "You are an expert podcast script writer. Create engaging 15-20 minute episode scripts that are part of a series. Include natural conversation flow, pauses, fillers, and transitions. Reference previous/future episodes when appropriate."
          },
          {
            role: "user",
            content: `Create a podcast script for Episode ${episodeNumber} of ${episodePlan.totalEpisodes}:

Series Topic: "${prompt}"
Episode Title: "${currentEpisode.title}"
Episode Focus: "${currentEpisode.description}"
Key Topics: ${currentEpisode.keyTopics.join(", ")}

Research Data: ${JSON.stringify(research)}

Include natural conversation elements like [pause], [thoughtful pause], [emphasis], etc. Reference this being part of a series when appropriate. Format as JSON: { "content": string, "sections": [{"type": string, "content": string, "duration": number}], "totalDuration": number, "analytics": {"wordCount": number, "readingTime": number, "speechTime": number, "pauseCount": number} }`
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
      throw new Error(`Failed to generate episode script: ${(error as Error).message}`);
    }
  }
}

export const openAIService = new OpenAIService();
