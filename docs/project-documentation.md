
# W3J Assistant - Project Documentation

## Project Overview
W3J Assistant is an AI-powered chat application that leverages multiple advanced language models from providers like Groq to deliver intelligent, context-aware responses to user queries. The application supports different personas, models, and capabilities, including conversation management, image uploads, and voice interactions.

## Architecture

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom neural-themed components
- **State Management**: React Context API, custom hooks, and Zustand for persistent settings
- **UI Components**: Shadcn UI library for consistent design

### Backend Integrations
- **AI Models**: Integration with Groq API for Llama, Gemma, and other models
- **Database**: Supabase for message and session storage
- **Authentication**: Supports user accounts with Supabase Auth

## Core Features

### Chat Interface
- Real-time AI responses with typing indicators
- Message history with deletion capability
- Support for various AI models with different capabilities
- Persona selection to customize AI behavior
- Image upload functionality
- Voice conversation capabilities

### Session Management
- Create new conversations
- Fork existing conversations
- Export conversations as JSON
- Session history

### Settings & Configuration
- API key management for Groq
- Default model selection
- UI preferences

## User Personas

### Casual User
- **Needs**: Quick answers, simplicity, intuitive interface
- **Use Cases**: General queries, creative writing assistance, information lookup

### Professional User
- **Needs**: Accurate responses, advanced features, data privacy
- **Use Cases**: Content creation, research assistance, document analysis

### Developer
- **Needs**: Technical information, code examples, API integration
- **Use Cases**: Debugging help, code generation, technical documentation

## API & Integration Details

### Groq API
- **Endpoint**: https://api.groq.com/openai/v1
- **Models**: Llama 3.3, Gemma 2, Compound, and others
- **Authentication**: API key stored in localStorage
- **Request Format**: OpenAI-compatible chat completion API

### Supabase (if integrated)
- **Tables**: 
  - `messages`: Stores chat messages
  - `chat_sessions`: Manages conversation sessions
  - `user_settings`: User preferences and API keys

## Code Structure

### Core Directories
- `/components`: UI components including chat interface elements
- `/hooks`: Custom React hooks for state management and business logic
- `/services`: Service classes for memory management and model capabilities
- `/integrations`: API clients for external services like Groq
- `/stores`: Zustand stores for application-wide state
- `/utils`: Utility functions and helpers
- `/types`: TypeScript type definitions

### Key Components
- `ChatInterface.tsx`: Main chat interface component
- `MessageList.tsx`: Displays chat message history
- `MessageInput.tsx`: User input component with file upload
- `ModelSelector.tsx`: Model selection dropdown
- `ApiKeyInput.tsx`: API key configuration component

### Important Hooks
- `useChat.tsx`: Main chat functionality
- `useMessages.tsx`: Message management
- `useSessions.tsx`: Session management
- `usePersona.tsx`: Persona selection and management

## Setup & Configuration

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Start development server: `npm run dev`

### API Keys
- Groq API key: Required for AI model access
  - Get from: https://console.groq.com/keys
  - Configure in app settings

### Deployment
- Netlify/Vercel supported
- Supabase connection required for multi-user support

## Testing Guidelines
- Unit tests for critical components
- Integration tests for API flows
- End-to-end tests for user workflows

## Security Considerations
- API keys stored in localStorage (client-side only)
- No PII stored by default
- Consider server-side implementation for production use

## Future Enhancements
- Enhanced voice conversation capabilities
- Support for more AI providers
- Advanced prompt templates
- Document analysis capabilities
- Code execution for developer workflows
- Knowledge base integration

## Troubleshooting
- API Key Issues: Check localStorage for proper key storage
- Model Selection: Ensure compatible models with persona
- Message Handling: Verify message format and context window size

## Version History
- v1.0.0: Initial release with basic chat functionality
- v1.1.0: Added multi-model support
- v1.2.0: Implemented persona system
- v1.3.0: Added conversation management (fork/export)
- v1.4.0: Voice conversation support
