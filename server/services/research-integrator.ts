// Research Integration Service for Enhanced Script Generation
// This service intelligently extracts and structures research data for better utilization

import OpenAI from "openai";
import { TopicAnalysis, DomainExpertise } from './topic-analyzer';

export interface StructuredResearch {
  keyNarratives: string[];
  criticalStats: Array<{ stat: string; source: string; context: string }>;
  compellingQuotes: Array<{ quote: string; speaker: string; context: string }>;
  technicalConcepts: Array<{ concept: string; explanation: string; importance: string }>;
  humanImpactStories: Array<{ story: string; impact: string; relevance: string }>;
  timelineEvents: Array<{ date: string; event: string; significance: string }>;
  futureImplications: string[];
  surprisingFacts: Array<{ fact: string; why_surprising: string; source: string }>;
  expertInsights: Array<{ insight: string; expert: string; credibility: string }>;
}

export interface EnhancedResearchResult {
  originalResearch: any; // Keep original for fallback
  structuredData: StructuredResearch;
  utilizationPlan: {
    introElements: string[];
    bodyElements: string[];
    conclusionElements: string[];
    engagementHooks: string[];
  };
  contentRichness: {
    totalDataPoints: number;
    narrativeStrength: number;
    evidenceQuality: number;
    engagementPotential: number;
  };
}

export class ResearchIntegrator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ 
      apiKey: apiKey || "sk-test-key",
      timeout: 60000
    });
  }

  async enhanceResearchData(
    originalResearch: any, 
    topicAnalysis: TopicAnalysis, 
    domainExpertise: DomainExpertise
  ): Promise<EnhancedResearchResult> {
    console.log('🔍 Analyzing research for intelligent extraction...');
    
    try {
      // Extract and structure the research data intelligently
      const structuredData = await this.extractStructuredData(originalResearch, topicAnalysis, domainExpertise);
      
      // Create utilization plan based on domain expertise
      const utilizationPlan = this.createUtilizationPlan(structuredData, topicAnalysis, domainExpertise);
      
      // Assess content richness
      const contentRichness = this.assessContentRichness(structuredData);
      
      console.log('📊 Research enhancement completed:', {
        dataPoints: contentRichness.totalDataPoints,
        narrativeStrength: contentRichness.narrativeStrength,
        evidenceQuality: contentRichness.evidenceQuality
      });

      return {
        originalResearch,
        structuredData,
        utilizationPlan,
        contentRichness
      };
    } catch (error) {
      console.error('Research enhancement failed, using fallback:', error);
      return this.createFallbackEnhancement(originalResearch);
    }
  }

  private async extractStructuredData(
    research: any, 
    topicAnalysis: TopicAnalysis, 
    domainExpertise: DomainExpertise
  ): Promise<StructuredResearch> {
    const researchText = this.extractResearchText(research);
    
    const extractionPrompt = `
You are a ${domainExpertise.expertTitle} analyzing research data for a ${topicAnalysis.domain} podcast.

Research Data: ${researchText}

Domain Context:
- Field: ${topicAnalysis.domain}
- Audience: ${topicAnalysis.audience}
- Complexity: ${topicAnalysis.complexity}
- Content Angle: ${topicAnalysis.angle}

Expert Requirements:
${domainExpertise.requirements.map(req => `• ${req}`).join('\n')}

Extract and structure this research data for maximum podcast impact. Focus on elements that will create engaging, authoritative content for ${topicAnalysis.audience} audience.

Return ONLY valid JSON in this exact format:
{
  "keyNarratives": ["narrative1", "narrative2", "narrative3"],
  "criticalStats": [{"stat": "specific statistic", "source": "source", "context": "why important"}],
  "compellingQuotes": [{"quote": "actual quote", "speaker": "who said it", "context": "why significant"}],
  "technicalConcepts": [{"concept": "concept name", "explanation": "clear explanation", "importance": "why it matters"}],
  "humanImpactStories": [{"story": "brief story", "impact": "what changed", "relevance": "why it matters"}],
  "timelineEvents": [{"date": "when", "event": "what happened", "significance": "why important"}],
  "futureImplications": ["implication1", "implication2", "implication3"],
  "surprisingFacts": [{"fact": "unexpected fact", "why_surprising": "why unexpected", "source": "where from"}],
  "expertInsights": [{"insight": "expert opinion", "expert": "expert name/title", "credibility": "why credible"}]
}

Prioritize quality over quantity. Each element should be podcast-ready and compelling for the target audience.`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content?.trim();
    if (!content) {
      throw new Error('No extraction content received');
    }

    // Clean JSON from potential markdown wrapping
    let cleanContent = content;
    if (content.includes('```json')) {
      cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    } else if (content.includes('```')) {
      cleanContent = content.replace(/```\s*/g, '').trim();
    }

    return JSON.parse(cleanContent);
  }

  private createUtilizationPlan(
    structuredData: StructuredResearch, 
    topicAnalysis: TopicAnalysis, 
    domainExpertise: DomainExpertise
  ) {
    // Create domain-specific utilization plan
    const template = domainExpertise.structureTemplate;
    
    return {
      introElements: [
        ...structuredData.surprisingFacts.slice(0, 2).map(f => f.fact),
        ...structuredData.keyNarratives.slice(0, 1),
        ...structuredData.criticalStats.slice(0, 1).map(s => s.stat)
      ],
      bodyElements: [
        ...structuredData.technicalConcepts.map(c => c.concept + ": " + c.explanation),
        ...structuredData.humanImpactStories.map(s => s.story),
        ...structuredData.timelineEvents.map(e => `${e.date}: ${e.event}`),
        ...structuredData.expertInsights.map(i => `"${i.insight}" - ${i.expert}`)
      ],
      conclusionElements: [
        ...structuredData.futureImplications,
        ...structuredData.keyNarratives.slice(1),
        ...structuredData.expertInsights.slice(-1).map(i => i.insight)
      ],
      engagementHooks: [
        ...structuredData.compellingQuotes.map(q => `"${q.quote}"`),
        ...structuredData.surprisingFacts.map(f => f.fact),
        ...structuredData.humanImpactStories.map(s => s.impact)
      ]
    };
  }

  private assessContentRichness(structuredData: StructuredResearch) {
    const totalDataPoints = 
      structuredData.keyNarratives.length +
      structuredData.criticalStats.length +
      structuredData.compellingQuotes.length +
      structuredData.technicalConcepts.length +
      structuredData.humanImpactStories.length +
      structuredData.timelineEvents.length +
      structuredData.futureImplications.length +
      structuredData.surprisingFacts.length +
      structuredData.expertInsights.length;

    const narrativeStrength = Math.min(10, 
      (structuredData.keyNarratives.length * 2) + 
      (structuredData.humanImpactStories.length * 2) +
      structuredData.compellingQuotes.length
    );

    const evidenceQuality = Math.min(10,
      (structuredData.criticalStats.length * 2) +
      (structuredData.expertInsights.length * 2) +
      structuredData.technicalConcepts.length
    );

    const engagementPotential = Math.min(10,
      (structuredData.surprisingFacts.length * 2) +
      (structuredData.compellingQuotes.length * 1.5) +
      structuredData.humanImpactStories.length
    );

    return {
      totalDataPoints,
      narrativeStrength,
      evidenceQuality,
      engagementPotential
    };
  }

  private extractResearchText(research: any): string {
    let text = "";
    
    // Extract from various research formats
    if (research.sources) {
      text += research.sources.map((s: any) => s.fullContent || s.summary || "").join(" ");
    }
    
    if (research.keyPoints) {
      text += " " + research.keyPoints.join(" ");
    }
    
    if (research.statistics) {
      text += " " + research.statistics.map((s: any) => `${s.fact} (${s.source})`).join(" ");
    }
    
    if (research.outline) {
      text += " " + research.outline.join(" ");
    }
    
    return text.trim();
  }

  private createFallbackEnhancement(originalResearch: any): EnhancedResearchResult {
    // Intelligent fallback that still provides structure
    const keyPoints = originalResearch.keyPoints || [];
    const statistics = originalResearch.statistics || [];
    
    return {
      originalResearch,
      structuredData: {
        keyNarratives: keyPoints.slice(0, 3),
        criticalStats: statistics.map((s: any) => ({
          stat: s.fact,
          source: s.source,
          context: "Supporting data point"
        })),
        compellingQuotes: [],
        technicalConcepts: keyPoints.slice(3, 6).map((point: string) => ({
          concept: point.split(':')[0] || point,
          explanation: point,
          importance: "Core concept for understanding"
        })),
        humanImpactStories: [],
        timelineEvents: [],
        futureImplications: keyPoints.slice(-2),
        surprisingFacts: [],
        expertInsights: []
      },
      utilizationPlan: {
        introElements: keyPoints.slice(0, 2),
        bodyElements: keyPoints.slice(2, -2),
        conclusionElements: keyPoints.slice(-2),
        engagementHooks: statistics.map((s: any) => s.fact)
      },
      contentRichness: {
        totalDataPoints: keyPoints.length + statistics.length,
        narrativeStrength: Math.min(10, keyPoints.length),
        evidenceQuality: Math.min(10, statistics.length * 2),
        engagementPotential: Math.min(10, statistics.length + keyPoints.length)
      }
    };
  }
}

export default ResearchIntegrator;
