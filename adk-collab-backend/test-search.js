import { googleSearchService } from './dist/services/GoogleSearchService.js';
import { ResearchAgent } from './dist/agents/ResearchAgent.js';

async function testSearch() {
  console.log('🧪 Testing Google Search Integration...\n');
  
  // Test 1: Direct search service
  console.log('1. Testing Google Search Service:');
  const searchResult = await googleSearchService.search('latest AI developments', 3);
  console.log('Search Results:', searchResult.summary);
  console.log('Configuration:', googleSearchService.getConfiguration());
  console.log('\n---\n');
  
  // Test 2: ResearchAgent with search
  console.log('2. Testing ResearchAgent with Search Integration:');
  const researchAgent = new ResearchAgent();
  await researchAgent.initialize();
  
  const researchResult = await researchAgent.research(
    'What are the latest developments in AI and machine learning in 2024?'
  );
  
  console.log('Research Result:');
  console.log(JSON.stringify(researchResult, null, 2));
  
  console.log('\n✅ Search integration test completed!');
}

testSearch().catch(console.error);