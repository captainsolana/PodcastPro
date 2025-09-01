// Test script for Domain-Aware Prompt Refinement
// This tests the new topic analysis and domain expertise integration

import { OpenAIService } from './server/services/openai';
import TopicAnalyzer from './server/services/topic-analyzer';

async function testDomainAwareRefinement() {
  console.log('🧪 Testing Domain-Aware Prompt Refinement\n');
  
  const testPrompts = [
    "How UPI transformed digital payments in India",
    "The rise of telemedicine and remote healthcare",
    "Understanding machine learning algorithms for beginners",
    "Sustainable business practices in modern corporations"
  ];

  const openaiService = new OpenAIService();
  
  for (const prompt of testPrompts) {
    console.log(`\n🎯 Testing prompt: "${prompt}"`);
    console.log('='.repeat(60));
    
    try {
      const result = await openaiService.refinePrompt(prompt);
      
      console.log('\n📊 TOPIC ANALYSIS:');
      if (result.topicAnalysis) {
        console.log(`Domain: ${result.topicAnalysis.domain}`);
        console.log(`Complexity: ${result.topicAnalysis.complexity}`);
        console.log(`Audience: ${result.topicAnalysis.audience}`);
        console.log(`Angle: ${result.topicAnalysis.angle}`);
        console.log(`Key Elements: ${result.topicAnalysis.keyElements.join(', ')}`);
      }
      
      console.log('\n🎯 DOMAIN EXPERTISE:');
      if (result.domainExpertise) {
        console.log(`Expert Title: ${result.domainExpertise.expertTitle}`);
        console.log(`Description: ${result.domainExpertise.description}`);
      }
      
      console.log('\n📝 REFINED PROMPT:');
      console.log(result.refinedPrompt);
      
      console.log('\n🎪 FOCUS AREAS:');
      result.focusAreas.forEach((area, index) => {
        console.log(`${index + 1}. ${area}`);
      });
      
      console.log(`\n⏱️  Suggested Duration: ${result.suggestedDuration} minutes`);
      console.log(`👥 Target Audience: ${result.targetAudience}`);
      
    } catch (error) {
      console.error(`❌ Error testing prompt: ${error}`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDomainAwareRefinement().catch(console.error);
}

export { testDomainAwareRefinement };
