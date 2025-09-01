// Domain Analysis Service for Topic Classification and Expertise
// This service analyzes podcast topics to determine domain expertise needed

import OpenAI from "openai";

export interface TopicAnalysis {
  domain: string;
  complexity: "beginner" | "intermediate" | "expert";
  audience: "general" | "technical" | "business" | "academic" | "student";
  angle: "historical" | "technical" | "human-impact" | "market-analysis" | "comparative" | "explanatory";
  scope: "single-concept" | "multi-faceted" | "comparative";
  keyElements: string[];
  contentGoals: string[];
  expertiseLevel: "basic" | "intermediate" | "advanced";
}

export interface DomainExpertise {
  expertTitle: string;
  description: string;
  requirements: string[];
  audienceGuidance: string;
  structureTemplate: string;
  keyQuestions: string[];
}

export class TopicAnalyzer {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ 
      apiKey: apiKey || "sk-test-key",
      timeout: 30000
    });
  }

  async analyzeTopic(originalPrompt: string): Promise<TopicAnalysis> {
    console.log('🔍 Analyzing topic domain and characteristics...');
    
    const analysisPrompt = `
Analyze this podcast topic request and categorize it for optimal content creation:

Topic: "${originalPrompt}"

You are an expert content strategist. Analyze this topic across multiple dimensions to ensure the best possible podcast content creation.

Return ONLY valid JSON in this exact format:
{
  "domain": "fintech|healthcare|education|business|technology|science|arts|history|politics|social|entertainment|sports|lifestyle",
  "complexity": "beginner|intermediate|expert",
  "audience": "general|technical|business|academic|student",
  "angle": "historical|technical|human-impact|market-analysis|comparative|explanatory",
  "scope": "single-concept|multi-faceted|comparative",
  "keyElements": ["element1", "element2", "element3", "element4", "element5"],
  "contentGoals": ["goal1", "goal2", "goal3"],
  "expertiseLevel": "basic|intermediate|advanced"
}

Analysis Guidelines:
- Domain: What field of expertise is most relevant?
- Complexity: What level of prior knowledge does this topic require?
- Audience: Who would be most interested and benefit from this content?
- Angle: What's the most compelling narrative approach?
- Scope: How broad is the topic coverage?
- Key Elements: What are the 5 most important aspects to cover?
- Content Goals: What should listeners gain from this episode?
- Expertise Level: How much domain expertise is needed to create quality content?

Consider the topic's depth, technical requirements, target audience, and optimal presentation style.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: analysisPrompt }],
        temperature: 0.3, // Lower temperature for consistent analysis
        max_tokens: 1000
      });

      const content = response.choices[0].message.content?.trim();
      if (!content) {
        throw new Error('No analysis content received');
      }

      console.log('📊 Topic analysis completed:', content.substring(0, 100) + '...');
      
      // Clean JSON from potential markdown wrapping
      let cleanContent = content;
      if (content.includes('```json')) {
        cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      } else if (content.includes('```')) {
        cleanContent = content.replace(/```\s*/g, '').trim();
      }
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error('Topic analysis failed:', error);
      // Return intelligent fallback based on simple keyword detection
      return this.getFallbackAnalysis(originalPrompt);
    }
  }

  getDomainExpertise(domain: string): DomainExpertise {
    const expertiseMap: Record<string, DomainExpertise> = {
      fintech: {
        expertTitle: "Financial Technology Analyst and Digital Payments Expert",
        description: "financial technology innovation, digital transformation, and payment systems",
        requirements: [
          "Technical innovation and system architecture details",
          "Market disruption patterns and adoption statistics",
          "Regulatory landscape and compliance considerations",
          "User experience design and accessibility impact",
          "Economic implications and sustainable business models",
          "Security frameworks and risk management"
        ],
        audienceGuidance: "Balance technical depth with accessibility for business professionals and general audience",
        structureTemplate: "Problem → Innovation → Technical Implementation → Market Impact → Future Evolution",
        keyQuestions: [
          "What problem did this technology solve?",
          "How does the technical architecture enable new possibilities?",
          "What drove mass adoption and market acceptance?",
          "How does this impact different user segments?",
          "What are the economic and regulatory implications?",
          "What's next in this technological evolution?"
        ]
      },
      healthcare: {
        expertTitle: "Healthcare Technology Specialist and Medical Innovation Researcher",
        description: "healthcare technology, medical innovation, and patient care transformation",
        requirements: [
          "Patient impact and clinical outcomes evidence",
          "Medical research findings and scientific validation",
          "Healthcare accessibility and equity considerations",
          "Regulatory compliance and safety standards",
          "Integration with existing healthcare systems",
          "Cost-effectiveness and scalability analysis"
        ],
        audienceGuidance: "Emphasize human impact while maintaining scientific accuracy and accessibility",
        structureTemplate: "Health Challenge → Innovation → Clinical Evidence → Patient Impact → Healthcare System Integration",
        keyQuestions: [
          "What health challenge does this address?",
          "What's the scientific evidence supporting this innovation?",
          "How does this improve patient outcomes?",
          "What are the accessibility and equity implications?",
          "How does this integrate with existing healthcare?",
          "What's the future of this medical advancement?"
        ]
      },
      technology: {
        expertTitle: "Technology Innovation Analyst and Digital Transformation Expert",
        description: "emerging technologies, digital innovation, and technological transformation",
        requirements: [
          "Technical architecture and implementation details",
          "Innovation drivers and breakthrough moments",
          "User adoption patterns and behavioral change",
          "Industry transformation and competitive dynamics",
          "Scalability challenges and solutions",
          "Future technological implications"
        ],
        audienceGuidance: "Make complex technology accessible through analogies and real-world applications",
        structureTemplate: "Technical Challenge → Innovation → Implementation → Adoption → Transformation → Future",
        keyQuestions: [
          "What technical limitation did this overcome?",
          "How does the underlying technology work?",
          "What drove user and industry adoption?",
          "How is this transforming existing industries?",
          "What are the scalability and deployment challenges?",
          "Where is this technology heading next?"
        ]
      },
      business: {
        expertTitle: "Business Strategy Analyst and Market Innovation Expert",
        description: "business innovation, market dynamics, and strategic transformation",
        requirements: [
          "Market dynamics and competitive landscape",
          "Business model innovation and sustainability",
          "Strategic decision-making and execution",
          "Stakeholder impact and value creation",
          "Operational excellence and efficiency gains",
          "Growth strategies and market expansion"
        ],
        audienceGuidance: "Focus on strategic insights and practical business applications",
        structureTemplate: "Market Opportunity → Strategy → Execution → Results → Lessons → Future Strategy",
        keyQuestions: [
          "What market opportunity was identified?",
          "What was the strategic approach and execution?",
          "How did this create value for stakeholders?",
          "What were the key success factors and challenges?",
          "What lessons can other businesses apply?",
          "What's the future business landscape?"
        ]
      },
      education: {
        expertTitle: "Educational Innovation Specialist and Learning Technology Expert",
        description: "educational innovation, learning methodologies, and academic transformation",
        requirements: [
          "Learning outcomes and educational effectiveness",
          "Pedagogical approaches and methodologies",
          "Student engagement and accessibility",
          "Technology integration and digital transformation",
          "Educational equity and inclusion",
          "Institutional change and scalability"
        ],
        audienceGuidance: "Emphasize learning impact and practical applications for educators and learners",
        structureTemplate: "Educational Challenge → Innovation → Implementation → Learning Outcomes → Broader Impact",
        keyQuestions: [
          "What educational challenge was being addressed?",
          "What innovative approach was developed?",
          "How was this implemented in educational settings?",
          "What were the learning outcomes and effectiveness?",
          "How does this promote educational equity?",
          "What's the future of this educational innovation?"
        ]
      }
    };

    return expertiseMap[domain] || {
      expertTitle: "Subject Matter Expert and Content Specialist",
      description: "specialized knowledge and industry expertise",
      requirements: [
        "Comprehensive background and context",
        "Current state analysis and key developments",
        "Stakeholder perspectives and impact assessment",
        "Practical applications and real-world examples",
        "Future trends and implications",
        "Lessons learned and best practices"
      ],
      audienceGuidance: "Provide comprehensive, accurate, and engaging content appropriate for the intended audience",
      structureTemplate: "Context → Current State → Analysis → Impact → Future Implications",
      keyQuestions: [
        "What's the essential background context?",
        "What are the current key developments?",
        "Who are the stakeholders and how are they impacted?",
        "What are the practical applications?",
        "What are the future implications?",
        "What lessons can be learned and applied?"
      ]
    };
  }

  private getFallbackAnalysis(prompt: string): TopicAnalysis {
    const promptLower = prompt.toLowerCase();
    
    // Simple keyword-based domain detection
    let domain = "business"; // default
    if (promptLower.includes('payment') || promptLower.includes('fintech') || promptLower.includes('banking') || promptLower.includes('upi')) {
      domain = "fintech";
    } else if (promptLower.includes('health') || promptLower.includes('medical') || promptLower.includes('clinical')) {
      domain = "healthcare";
    } else if (promptLower.includes('tech') || promptLower.includes('software') || promptLower.includes('ai') || promptLower.includes('digital')) {
      domain = "technology";
    } else if (promptLower.includes('education') || promptLower.includes('learning') || promptLower.includes('school')) {
      domain = "education";
    }

    // Determine complexity based on technical terms
    let complexity: "beginner" | "intermediate" | "expert" = "intermediate";
    if (promptLower.includes('basic') || promptLower.includes('introduction') || promptLower.includes('beginner')) {
      complexity = "beginner";
    } else if (promptLower.includes('advanced') || promptLower.includes('technical') || promptLower.includes('expert')) {
      complexity = "expert";
    }

    // Determine audience
    let audience: "general" | "technical" | "business" | "academic" | "student" = "general";
    if (promptLower.includes('business') || promptLower.includes('enterprise') || promptLower.includes('market')) {
      audience = "business";
    } else if (promptLower.includes('technical') || promptLower.includes('developer') || promptLower.includes('engineering')) {
      audience = "technical";
    }

    return {
      domain,
      complexity,
      audience,
      angle: "explanatory",
      scope: "multi-faceted",
      keyElements: [
        "Background and context",
        "Key concepts and principles", 
        "Current applications and use cases",
        "Impact and implications",
        "Future developments"
      ],
      contentGoals: [
        "Educate listeners on the topic",
        "Provide practical insights",
        "Inspire further exploration"
      ],
      expertiseLevel: "intermediate"
    };
  }
}

export default TopicAnalyzer;
