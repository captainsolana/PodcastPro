// Simple test for Topic Analyzer
import TopicAnalyzer from './server/services/topic-analyzer.js';

async function testTopicAnalyzer() {
  console.log('🧪 Testing Topic Analyzer...\n');
  
  const analyzer = new TopicAnalyzer('test-key');
  
  // Test UPI payment topic
  const testPrompt = "How UPI transformed digital payments in India";
  console.log(`🎯 Analyzing: "${testPrompt}"`);
  
  try {
    const analysis = await analyzer.analyzeTopic(testPrompt);
    console.log('\n📊 Topic Analysis Result:');
    console.log(JSON.stringify(analysis, null, 2));
    
    const expertise = analyzer.getDomainExpertise(analysis.domain);
    console.log('\n🎓 Domain Expertise:');
    console.log(`Expert Title: ${expertise.expertTitle}`);
    console.log(`Description: ${expertise.description}`);
    console.log('\nKey Questions:');
    expertise.keyQuestions.forEach((q, i) => console.log(`  ${i+1}. ${q}`));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Test fallback analysis
    console.log('\n🔄 Testing fallback analysis...');
    const fallbackAnalysis = analyzer['getFallbackAnalysis'](testPrompt);
    console.log('Fallback analysis:', JSON.stringify(fallbackAnalysis, null, 2));
  }
}

testTopicAnalyzer();
