import fetch from 'node-fetch';

/**
 * Demo script for AI Team Collaboration
 * This demonstrates the multi-agent system in action
 */

const BASE_URL = 'http://localhost:5000';

async function testTeamStatus() {
  console.log('🏥 Checking Team Status...');
  try {
    const response = await fetch(`${BASE_URL}/api/team/status`);
    const data = await response.json();
    console.log('✅ Team Status:', JSON.stringify(data, null, 2));
    return data.available;
  } catch (error) {
    console.error('❌ Team status check failed:', error.message);
    return false;
  }
}

async function demoTeamCollaboration() {
  console.log('\n🎭 AI Team Collaboration Demo');
  console.log('================================\n');

  // Test cases to demonstrate different types of collaboration
  const testCases = [
    {
      name: "📝 Content Creation Task",
      prompt: "Create a comprehensive guide about the benefits of local AI development for privacy-conscious businesses",
      description: "This should trigger: Planning → Research → Writing → Review"
    },
    {
      name: "🔍 Research-Heavy Task", 
      prompt: "What are the latest trends in edge computing and how do they relate to local AI deployment?",
      description: "This focuses more on research and analysis"
    },
    {
      name: "📋 Strategic Planning Task",
      prompt: "Develop a roadmap for implementing AI agents in small businesses with limited technical resources",
      description: "This emphasizes planning and strategic thinking"
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.name}`);
    console.log(`📄 Description: ${testCase.description}`);
    console.log(`💭 Prompt: "${testCase.prompt}"`);
    console.log('⏳ Processing...\n');

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${BASE_URL}/api/team/collaborate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: testCase.prompt,
          // You can customize workflow with options
          options: {
            // skipPlanning: false,
            // skipResearch: false, 
            // skipWriting: false,
            // skipReview: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const duration = Date.now() - startTime;

      console.log('🎉 Collaboration Result:');
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`👥 Phases: ${result.collaboration_summary.phases_completed.join(' → ')}`);
      
      if (result.final_output) {
        console.log('\n📋 Final Output:');
        console.log(`Type: ${result.final_output.type}`);
        if (result.final_output.title) {
          console.log(`Title: ${result.final_output.title}`);
        }
        if (result.final_output.summary) {
          console.log(`Summary: ${result.final_output.summary}`);
        }
        if (result.final_output.quality_score) {
          console.log(`Quality Score: ${result.final_output.quality_score}/10`);
        }
      }

      // Show some agent contributions
      if (result.results.research && result.results.research.key_insights) {
        console.log(`\n🔍 Research Insights: ${result.results.research.key_insights.slice(0, 2).join(', ')}...`);
      }
      
      if (result.results.writing && result.results.writing.word_count) {
        console.log(`✍️  Content: ${result.results.writing.word_count} words generated`);
      }

      if (result.results.review && result.results.review.overall_score) {
        console.log(`⭐ Review Score: ${result.results.review.overall_score}/10`);
      }

    } catch (error) {
      console.error(`❌ Test failed: ${error.message}`);
    }

    console.log('\n' + '─'.repeat(60));
  }
}

async function demonstrateWorkflowOptions() {
  console.log('\n⚙️  Demonstrating Workflow Customization');
  console.log('==========================================\n');

  const prompt = "Explain the benefits of TypeScript for AI development";

  // Research-only workflow
  console.log('🔍 Research-Only Workflow...');
  try {
    const response = await fetch(`${BASE_URL}/api/team/collaborate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt,
        options: {
          skipPlanning: true,
          skipWriting: true,
          skipReview: true
        }
      })
    });
    
    const result = await response.json();
    console.log(`✅ Research completed: ${result.collaboration_summary.phases_completed.join(' → ')}`);
  } catch (error) {
    console.error(`❌ Research-only test failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting AI Team Collaboration Demo\n');

  // Check if team is available
  const teamAvailable = await testTeamStatus();
  
  if (!teamAvailable) {
    console.log('❌ AI Team is not available. Make sure the server is running with team features enabled.');
    return;
  }

  // Clear any previous history for clean demo
  try {
    await fetch(`${BASE_URL}/api/team/clear-history`, { method: 'POST' });
    console.log('🧹 Cleared previous conversation history\n');
  } catch (error) {
    console.log('⚠️  Could not clear history (this is ok)\n');
  }

  // Run the main demo
  await demoTeamCollaboration();
  
  // Show workflow customization
  await demonstrateWorkflowOptions();

  console.log('\n🎊 Demo Complete!');
  console.log('\n💡 Try these endpoints:');
  console.log('   GET  /api/team/status - Check team status');
  console.log('   POST /api/team/collaborate - Team collaboration');
  console.log('   POST /api/ask - Single agent (original)');
  console.log('   GET  /health - Server health check');
}

// Run the demo
main().catch(console.error);