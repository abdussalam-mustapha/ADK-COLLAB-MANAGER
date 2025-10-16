# ADK-COLLAB: Multi-Agent AI Collaboration Platform

> **Built for the ADK-TS Hackathon** - A comprehensive AI team collaboration system powered by ADK-TS v0.4.0

[![ADK-TS](https://img.shields.io/badge/ADK--TS-v0.4.0-blue.svg)](https://github.com/iqai/adk-ts)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)

## Overview

**ADK-COLLAB** is an advanced multi-agent AI collaboration platform that demonstrates the power of **ADK-TS** (AI Development Kit for TypeScript) in creating sophisticated agent-based systems. This project showcases how multiple specialized AI agents can work together seamlessly to tackle complex tasks through coordinated collaboration.

### The Problem We Solve

Traditional AI applications often rely on single-agent interactions, limiting their ability to handle complex, multi-faceted tasks that require diverse expertise. **ADK-COLLAB** addresses this by:

- **Breaking down complex tasks** into specialized domains (planning, research, writing, review)
- **Coordinating multiple AI agents** with distinct roles and capabilities
- **Providing real-time collaboration** with live progress tracking
- **Enabling dynamic agent creation** for custom workflows
- **Integrating web search capabilities** for up-to-date information
- **Maintaining conversation history** with persistent storage

### Key Features

#### **Multi-Agent Architecture**
- **4 Specialized Agents**: Planner, Researcher, Writer, and Reviewer
- **Dynamic Agent Creation**: Add custom agents with specific roles
- **Intelligent Task Routing**: Automatic assignment based on agent capabilities
- **Real-time Collaboration**: Live progress tracking and agent communication

#### **Enhanced Research Capabilities**
- **Google Search Integration**: Real-time web search for current information
- **Multi-source Research**: Combines web data with AI knowledge
- **Source Attribution**: Proper citation and reference tracking
- **Research Synthesis**: Intelligent information consolidation

#### **Persistent Storage System**
- **File-based JSON Storage**: No database dependency
- **Session Management**: Complete conversation history
- **Agent Configuration**: Persistent agent settings and capabilities
- **Export Functionality**: Copy and export results

#### **Modern Web Interface**
- **Dark Theme Design**: Professional, eye-friendly interface
- **Responsive Layout**: Works on desktop and mobile
- **Real-time Updates**: Live agent activity feed
- **Modal Dialogs**: Intuitive task and agent creation

## Architecture

### Frontend (React + TypeScript)
```
adk-collab/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main collaboration interface
│   │   ├── HistoryPage.tsx  # Session history management
│   │   ├── SettingsPage.tsx # Configuration interface
│   │   └── layout/          # Header, Footer, Navigation
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API client services
│   └── assets/              # Static resources
```

### Backend (Node.js + ADK-TS)
```
adk-collab-backend/
├── src/
│   ├── agents/              # AI Agent implementations
│   │   ├── PlannerAgent.ts  # Strategic planning & coordination
│   │   ├── ResearchAgent.ts # Research & information gathering
│   │   ├── WriterAgent.ts   # Content creation & writing
│   │   ├── ReviewerAgent.ts # Quality assurance & review
│   │   └── TeamManager.ts   # Multi-agent orchestration
│   ├── services/            # External service integrations
│   │   ├── GoogleSearchService.ts # Web search capabilities
│   │   └── FileStorage.ts   # Persistent data storage
│   ├── storage/             # Data persistence layer
│   └── server.ts            # Express.js API server
```

## Setup Guide

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Ollama** (for local AI models) - *Optional*
- **Google Search API** credentials - *Optional*

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/adk-collab.git
cd adk-collab
```

### 2. Backend Setup

```bash
cd adk-collab-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Configure Environment Variables

Edit `.env` file:

```env
# Ollama Configuration (Optional - for local models)
OLLAMA_BASE_URL=http://localhost:11434

# Google Search API (Optional - for web search)
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Install Ollama (Optional - for local models)

```bash
# Download and install Ollama from https://ollama.ai/

# Pull a model (recommended: llama3.2 or gemma2)
ollama pull llama3.2:latest
```

#### Start Backend Server

```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../adk-collab

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Google Search Setup (Optional)

For enhanced research capabilities:

1. **Create Google Custom Search Engine**:
   - Visit [Google Custom Search](https://cse.google.com/)
   - Create a new search engine
   - Set it to search the entire web
   - Copy the Search Engine ID

2. **Get Google API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Custom Search JSON API
   - Create credentials (API Key)
   - Copy the API key

3. **Update Environment**:
   ```env
   GOOGLE_SEARCH_API_KEY=your_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_engine_id_here
   ```

## How It Works

### 1. **Task Initiation**
- Users submit tasks through the web interface
- The system analyzes the task complexity and requirements
- Appropriate agents are selected based on task type

### 2. **Agent Collaboration Workflow**

#### **Phase 1: Planning**
- **PlannerAgent** analyzes the request
- Breaks down complex tasks into manageable components
- Creates execution strategy and resource allocation
- Defines success criteria and deliverables

#### **Phase 2: Research**
- **ResearchAgent** gathers relevant information
- Performs web searches for current data (if configured)
- Synthesizes information from multiple sources
- Provides comprehensive research foundation

#### **Phase 3: Content Creation**
- **WriterAgent** creates structured content
- Uses research findings and planning guidelines
- Adapts tone and style to target audience
- Produces well-formatted, engaging output

#### **Phase 4: Quality Assurance**
- **ReviewerAgent** evaluates the final output
- Checks for accuracy, clarity, and completeness
- Provides improvement suggestions
- Ensures quality standards are met

### 3. **Real-time Monitoring**
- Live agent activity feed shows progress
- Individual agent outputs are displayed
- Users can track each phase of collaboration
- Copy functionality for easy result sharing

### 4. **Dynamic Agent Management**
- Create custom agents with specific roles
- Configure agent capabilities and priorities
- Assign agents to specialized workflows
- Manage agent collaboration rules

## ADK-TS Integration

This project extensively leverages **ADK-TS v0.4.0** capabilities:

### **Core ADK-TS Features Used**

#### **1. AgentBuilder Pattern**
```typescript
import { AgentBuilder } from "@iqai/adk";

export class ResearchAgent {
  async initialize() {
    const { runner } = await AgentBuilder.create("ResearchAgent")
      .withDescription("Advanced research agent with Google Search capabilities")
      .withModel("gemini-2.5-flash")
      .withInstruction(this.getInstructions())
      .build();
    
    this.runner = runner;
  }
}
```

#### **2. Multi-Agent Orchestration**
```typescript
export class TeamManager {
  private agents: Map<string, any> = new Map();
  
  async processCollaborativeTask(task: string): Promise<CollaborationResult> {
    // Phase-based agent execution
    const planningResult = await this.agents.get('PlannerAgent').plan(task);
    const researchResult = await this.agents.get('ResearchAgent').research(task, planningResult);
    const writingResult = await this.agents.get('WriterAgent').write(task, researchResult);
    const reviewResult = await this.agents.get('ReviewerAgent').review(writingResult);
    
    return this.synthesizeResults([planningResult, researchResult, writingResult, reviewResult]);
  }
}
```

#### **3. Model Provider Flexibility**
- **Local Ollama Integration**: For privacy and offline capabilities
- **Remote API Support**: For advanced models via ADK-TS
- **Dynamic Model Switching**: Based on availability and requirements

#### **4. Structured Agent Communication**
```typescript
interface AgentResponse {
  agent: string;
  phase: string;
  content: string;
  metadata: {
    timestamp: string;
    duration: number;
    confidence: number;
  };
  next_steps?: string[];
}
```

### **ADK-TS Hackathon Highlights**

#### **Why ADK-TS?**
1. **Rapid Agent Development**: ADK-TS's AgentBuilder pattern enabled quick creation of specialized agents
2. **Model Agnostic Design**: Seamless switching between local Ollama and cloud models
3. **TypeScript Integration**: Strong typing and excellent developer experience
4. **Extensible Architecture**: Easy to add new agents and capabilities

#### **Key Innovations Built with ADK-TS**
1. **Multi-Agent Workflow Engine**: Coordinated agent execution with state management
2. **Dynamic Agent Registration**: Runtime agent creation and configuration
3. **Persistent Agent Memory**: Context preservation across sessions
4. **Real-time Agent Communication**: Live collaboration updates

#### **Performance Optimizations**
- **Concurrent Agent Execution**: Parallel processing where possible
- **Intelligent Caching**: Reuse of research and planning results
- **Graceful Degradation**: Fallback strategies for model failures

## Features Showcase

### **1. Multi-Agent Dashboard**
- Visual representation of agent workflow
- Real-time progress tracking
- Individual agent output display
- Collaborative result synthesis

### **2. Intelligent Research**
- Google Search integration for current information
- Multi-source data synthesis
- Source attribution and verification
- Research methodology transparency

### **3. Dynamic Agent Creation**
```typescript
// Create custom agents on-the-fly
const customAgent = await createNewAgent({
  name: "AnalysisAgent",
  role: "Data Analysis Specialist",
  capabilities: ["statistical_analysis", "data_visualization"],
  instructions: "Focus on quantitative analysis and insights"
});
```

### **4. Conversation History**
- Complete session persistence
- Searchable conversation logs
- Export capabilities
- Performance analytics

### **5. Configuration Management**
- Agent behavior customization
- Workflow rule definition
- Model preference settings
- Integration configurations

## Google Search Integration

### **Enhanced Research Capabilities**

#### **Automatic Query Generation**
```typescript
private extractSearchQueries(prompt: string): string[] {
  // Intelligent query extraction from research prompts
  const queries: string[] = [];
  
  // Look for current/recent indicators
  const currentIndicators = /\b(current|recent|latest|today|2024|2025)\b/gi;
  if (currentIndicators.test(prompt)) {
    // Generate current-focused search queries
  }
  
  return queries.slice(0, 3); // Limit to 3 searches
}
```

#### **Multi-Source Research**
- **Web Search Results**: Real-time information from Google
- **Knowledge Base**: AI model's training data
- **Source Verification**: Cross-reference information accuracy
- **Citation Management**: Proper source attribution

#### **Search Strategy**
- **Current Events**: Web search for latest information
- **Historical Data**: Combine training knowledge with verification
- **Technical Topics**: Recent developments and best practices
- **Market Data**: Industry reports and insights

## Advanced Usage

### **Custom Workflow Creation**

```typescript
// Define custom collaboration workflows
const customWorkflow = {
  name: "Technical Documentation",
  phases: ["research", "writing", "technical_review"],
  agents: ["ResearchAgent", "WriterAgent", "TechnicalReviewerAgent"],
  rules: {
    max_iterations: 2,
    require_technical_accuracy: true,
    include_code_examples: true
  }
};
```

### **Agent Specialization**

```typescript
// Create domain-specific agents
const agents = [
  {
    name: "LegalResearchAgent",
    specialization: "legal_research",
    capabilities: ["case_law_analysis", "regulatory_compliance"],
    search_domains: ["legal databases", "court records"]
  },
  {
    name: "TechnicalWriterAgent", 
    specialization: "technical_documentation",
    capabilities: ["api_documentation", "user_guides", "code_examples"],
    output_formats: ["markdown", "restructured_text", "docbook"]
  }
];
```

### **Performance Monitoring**

```typescript
// Built-in analytics and monitoring
interface CollaborationMetrics {
  total_duration: number;
  agent_performance: {
    [agentName: string]: {
      response_time: number;
      accuracy_score: number;
      collaboration_rating: number;
    };
  };
  workflow_efficiency: number;
  user_satisfaction: number;
}
```

## Project Structure

### **Technology Stack**

#### **Frontend**
- **React 19.1.1**: Modern UI framework
- **TypeScript 5.9.3**: Type-safe development
- **Vite 7.1.7**: Fast build tool
- **Lucide React**: Beautiful icons
- **React Router**: Client-side routing

#### **Backend** 
- **Node.js**: JavaScript runtime
- **Express 5.1.0**: Web framework
- **ADK-TS 0.4.0**: AI agent framework
- **TypeScript**: Type-safe backend
- **Ollama Integration**: Local AI models

#### **AI & Search**
- **ADK-TS**: Agent orchestration
- **Google Custom Search**: Web search
- **Ollama**: Local model inference
- **Multiple Model Support**: Flexibility in AI providers

#### **Storage & Data**
- **JSON File Storage**: Simple, portable persistence
- **UUID**: Unique identifier generation
- **Zod**: Runtime type validation
- **CORS**: Cross-origin resource sharing

## Use Cases

### **1. Content Creation Pipeline**
- **Blog Posts**: Research → Write → Review workflow
- **Technical Documentation**: Spec analysis → Documentation → Technical review
- **Marketing Materials**: Market research → Creative writing → Brand review

### **2. Research & Analysis**
- **Market Research**: Multi-source data gathering and synthesis
- **Competitive Analysis**: Comprehensive competitor profiling
- **Technical Research**: Latest developments and best practices

### **3. Educational Content**
- **Course Materials**: Curriculum planning → Content creation → Peer review
- **Training Programs**: Skills assessment → Content development → Quality assurance
- **Knowledge Base**: Information gathering → Documentation → Accuracy verification

### **4. Business Intelligence**
- **Strategic Planning**: Market analysis → Strategy formulation → Risk assessment
- **Process Optimization**: Current state analysis → Improvement planning → Implementation review
- **Decision Support**: Data gathering → Analysis → Recommendation synthesis

## Contributing

We welcome contributions! Here's how to get started:

### **Development Workflow**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow TypeScript and React best practices
4. **Test thoroughly**: Ensure all agents work correctly
5. **Submit a pull request**: Describe your changes clearly

### **Adding New Agents**

```typescript
// 1. Create agent class
export class CustomAgent {
  async initialize() {
    const { runner } = await AgentBuilder.create("CustomAgent")
      .withDescription("Your agent description")
      .withModel("your-preferred-model")
      .withInstruction("Detailed agent instructions")
      .build();
    
    this.runner = runner;
  }
  
  async process(input: string, context?: any): Promise<any> {
    // Your agent logic here
  }
}

// 2. Register in TeamManager
// 3. Add to team-config.json
// 4. Update frontend components
```

### **Extending Search Capabilities**

```typescript
// Add new search providers
export class CustomSearchService {
  async search(query: string): Promise<SearchResult[]> {
    // Implement your search logic
  }
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **ADK-TS Team**: For creating an excellent AI development framework
- **Ollama**: For local AI model infrastructure
- **Google**: For Custom Search API
- **React Community**: For amazing frontend tools
- **TypeScript Team**: For robust type safety

## Links

- **ADK-TS Documentation**: [https://github.com/iqai/adk-ts](https://github.com/iqai/adk-ts)
- **Ollama**: [https://ollama.ai/](https://ollama.ai/)
- **Google Custom Search**: [https://developers.google.com/custom-search](https://developers.google.com/custom-search)
- **Project Repository**: [Your GitHub Repository URL]

## Support

For questions, issues, or contributions:

- **GitHub Issues**: [Your Repository Issues URL]
- **Discussions**: [Your Repository Discussions URL]
- **Email**: your-email@example.com

---

**Built with love for the ADK-TS Hackathon** 

*Demonstrating the power of collaborative AI through intelligent agent coordination*