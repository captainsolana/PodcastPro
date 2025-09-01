# Content Analysis Models and Enhanced Logging

## 🤖 **Current LLM Models for Content Analysis**

### Research Phase (`/api/ai/research`)
- **Model**: Perplexity `sonar-reasoning`
- **Timeout**: 6 minutes (360,000ms)
- **Max Tokens**: 4,000
- **Purpose**: Comprehensive research with real-time web data

### Content Analysis Phase (`/api/ai/analyze-episodes`) 
- **Model**: OpenAI `gpt-5`
- **Reasoning Effort**: `low` (for faster response)
- **Verbosity**: `medium`
- **Response Format**: `json_object`
- **Purpose**: Episode breakdown and content structuring

## 📋 **Enhanced Logging Added**

### Route Level Logging (`server/routes.ts`)

#### Research Route (`/api/ai/research`)
```
📊 ROUTE: Starting research phase...
📝 Research prompt: [first 100 chars]...
🚀 ROUTE: Making research API call...
✅ ROUTE: Research completed successfully in [X] ms
📊 ROUTE: Research sources count: [N]
📈 ROUTE: Key points extracted: [N]
📋 ROUTE: Statistics found: [N]
```

#### Content Analysis Route (`/api/ai/analyze-episodes`)
```
🎭 ROUTE: Starting content analysis phase...
📝 Analysis prompt: [first 100 chars]...
📊 Research data size: [X] characters
🧠 Using model: GPT-5 with low reasoning effort
🚀 ROUTE: Making content analysis API call...
✅ ROUTE: Content analysis completed in [X] ms
📺 ROUTE: Multi-episode result: [true/false]
🔢 ROUTE: Total episodes planned: [N]
📋 ROUTE: Episodes breakdown: [N] episodes
```

### Service Level Logging (`server/services/openai.ts`)

#### Research Service
```
🔬 SERVICE: Starting research phase
📝 SERVICE: Research prompt length: [X] characters
🌐 SERVICE: Starting comprehensive research with Perplexity
🔑 SERVICE: Perplexity API key status: SET/NOT SET
🎯 SERVICE: Using Perplexity sonar-reasoning model
✅ SERVICE: Research completed with rich content for script generation
📊 SERVICE: Research content length: [X] characters
📈 SERVICE: Key points extracted: [N]
📋 SERVICE: Statistics extracted: [N]
```

#### Perplexity API Call
```
🔥 SERVICE: ATTEMPTING REAL PERPLEXITY API CALL for research
📝 SERVICE: Query length: [X] characters
🎯 SERVICE: Using sonar-reasoning model with 4000 max tokens
🔐 SERVICE: Using Perplexity API key: [first8chars]...
🚀 SERVICE: Making REAL Perplexity API call now...
✅ SERVICE: Perplexity API call completed in [X] ms
📊 SERVICE: Perplexity response received, processing...
✅ SERVICE: Perplexity research content processed, length: [X] characters
📝 SERVICE: Content preview: [first 200 chars]...
```

#### Content Analysis Service
```
🎭 SERVICE: Starting episode breakdown analysis
📝 SERVICE: Analysis prompt: [first 100 chars]...
🧠 SERVICE: Using GPT-5 with low reasoning effort
📊 SERVICE: Research input size: [X] characters
🚀 SERVICE: Making GPT-5 API call for episode analysis...
✅ SERVICE: GPT-5 episode analysis completed in [X] ms
📺 SERVICE: Multi-episode decision: [true/false]
🔢 SERVICE: Total episodes planned: [N]
📋 SERVICE: Episode breakdown created: [N] episodes
```

## 🎯 **Benefits of Enhanced Logging**

### 1. **Performance Monitoring**
- **Timing**: Track exact API call durations
- **Bottlenecks**: Identify slow operations
- **Timeouts**: See where timeouts occur

### 2. **Data Flow Tracking**
- **Input Size**: Monitor prompt and data sizes
- **Output Quality**: Track extracted data counts
- **Content Volume**: Monitor research content volume

### 3. **API Status Monitoring**
- **Authentication**: Verify API keys are set
- **Model Usage**: Confirm which models are being used
- **Response Status**: Track successful vs failed calls

### 4. **Debugging Support**
- **Error Context**: Rich error information with timing
- **Data Preview**: See content snippets for debugging
- **Process Flow**: Clear visibility into each processing step

### 5. **Quality Assurance**
- **Research Quality**: Monitor extracted key points and statistics
- **Content Analysis**: Track episode planning decisions
- **Model Performance**: Compare response times and quality

## 🚀 **What You'll See in Testing**

When testing the Content Analysis section, you'll now see detailed logs like:

```
📊 ROUTE: Starting research phase...
📝 Research prompt: How UPI transformed digital payments in India...
🌐 SERVICE: Starting comprehensive research with Perplexity
🎯 SERVICE: Using Perplexity sonar-reasoning model
🚀 SERVICE: Making REAL Perplexity API call now...
✅ SERVICE: Perplexity API call completed in 45233 ms
📊 SERVICE: Research content length: 4247 characters
📈 SERVICE: Key points extracted: 8
📋 SERVICE: Statistics extracted: 5
✅ ROUTE: Research completed successfully in 45344 ms

🎭 ROUTE: Starting content analysis phase...
🧠 Using model: GPT-5 with low reasoning effort
🚀 SERVICE: Making GPT-5 API call for episode analysis...
✅ SERVICE: GPT-5 episode analysis completed in 12445 ms
📺 SERVICE: Multi-episode decision: true
🔢 SERVICE: Total episodes planned: 3
✅ ROUTE: Content analysis completed in 12556 ms
```

This will help you track exactly what's happening, which models are being used, and how long each step takes! 📊
