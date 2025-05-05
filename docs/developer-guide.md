# W3J Assistant - Developer Guide

## Architecture Overview

W3J Assistant is built using a modern React architecture with TypeScript, leveraging custom hooks for state management and business logic separation. The application follows a component-based design with clear separation of concerns.

### Core Technologies
- **React**: UI component library
- **TypeScript**: Type safety and improved developer experience
- **Tailwind CSS**: Styling and responsive design
- **Shadcn UI**: Component library for consistent design
- **Zustand**: Lightweight state management
- **Framer Motion**: Animations and transitions
- **Supabase**: Backend services (optional)

## Project Structure

```
src/
├── components/          # UI components
│   ├── chat/            # Chat-specific components
│   └── ui/              # Shadcn UI components
├── hooks/               # Custom React hooks
├── integrations/        # External API integrations
│   ├── groq/            # Groq API integration
│   └── supabase/        # Supabase integration
├── pages/               # Page components
├── services/            # Service classes
├── stores/              # Zustand stores
├── styles/              # Global styles
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Key Components & Hooks

### Core Components

#### `ChatInterface.tsx`
The main chat interface component that orchestrates the chat experience.

```tsx
// Usage example
import ChatInterface from '@/components/chat/ChatInterface';

function App() {
  return (
    <div className="app-container">
      <ChatInterface />
    </div>
  );
}
```

#### `MessageInput.tsx`
Handles user input, including text and file uploads.

```tsx
// Usage example
import MessageInput from '@/components/chat/MessageInput';

function ChatFooter() {
  return (
    <MessageInput
      onSendMessage={handleSendMessage}
      onFileSelected={handleFileSelected}
      isTyping={isTyping}
    />
  );
}
```

### Custom Hooks

#### `useChat.tsx`
Primary hook for chat functionality that combines other specialized hooks.

```tsx
// Usage example
import useChat from '@/hooks/useChat';

function ChatComponent() {
  const {
    messages,
    sendMessage,
    isTyping,
    deleteMessage
  } = useChat();
  
  // Component implementation
}
```

#### `useMessages.tsx`
Manages message state and operations.

#### `useSessions.tsx`
Handles conversation sessions and persistence.

#### `usePersona.tsx`
Controls AI persona selection and management.

## State Management

### Zustand Stores

#### `settingsStore.ts`
Manages application settings with persistence.

```tsx
// Usage example
import { useSettingsStore } from '@/stores/settingsStore';

function SettingsComponent() {
  const { defaultModel, setDefaultModel } = useSettingsStore();
  
  // Component implementation
}
```

## Working with API Integrations

### Groq API

The application uses Groq's API for AI model interactions, configured through the `groq/service.ts` module.

```tsx
// Example of using the Groq API
import { createGroqChatCompletion } from '@/integrations/groq/service';

async function generateResponse(messages) {
  const response = await createGroqChatCompletion({
    messages,
    model: 'llama-3.3-70b-versatile'
  });
  
  return response;
}
```

### API Key Management

API keys are stored in localStorage via the `groq/client.ts` module:

```tsx
// Checking for a valid API key
import { hasGroqKey } from '@/integrations/groq/client';

if (!hasGroqKey()) {
  // Show API key input
}
```

## Memory Management

The `MemoryManager` class handles conversation context and persistence:

```tsx
// Example usage
import { MemoryManager } from '@/services/MemoryManager';

const memoryManager = new MemoryManager();
await memoryManager.saveMessage(message);
const contextWindow = memoryManager.getContextWindow();
```

## Adding New Features

### Adding a New Model Provider

1. Create a new service in `integrations/`:
```tsx
// integrations/newProvider/service.ts
export const createNewProviderCompletion = async (request) => {
  // Implementation
};
```

2. Update the model selection logic:
```tsx
// In relevant component/hook
const providers = {
  'groq': createGroqChatCompletion,
  'newProvider': createNewProviderCompletion
};

const provider = providers[getProviderForModel(selectedModel)];
const response = await provider(request);
```

### Adding a New Persona

1. Add the persona to the `ModelManager` service:
```tsx
// In ModelManager.ts or similar
const personas = [
  // Existing personas
  {
    id: 'new-persona',
    name: 'New Persona',
    description: 'Description of the new persona',
    systemPrompt: 'You are a new persona with specific characteristics...',
    suitableModels: ['model1', 'model2']
  }
];
```

## Testing

### Component Testing

Use React Testing Library for component tests:

```tsx
// Example test for MessageInput
import { render, screen, fireEvent } from '@testing-library/react';
import MessageInput from '@/components/chat/MessageInput';

test('sends message when submit button is clicked', () => {
  const mockSendMessage = jest.fn();
  render(<MessageInput onSendMessage={mockSendMessage} />);
  
  const input = screen.getByPlaceholderText('Type your message...');
  fireEvent.change(input, { target: { value: 'Hello' } });
  
  const button = screen.getByRole('button', { name: /send/i });
  fireEvent.click(button);
  
  expect(mockSendMessage).toHaveBeenCalledWith('Hello', undefined);
});
```

### Hook Testing

Test custom hooks with React Testing Library's `renderHook`:

```tsx
// Example test for useChat hook
import { renderHook, act } from '@testing-library/react';
import useChat from '@/hooks/useChat';

test('sends a message and updates state', async () => {
  const { result } = renderHook(() => useChat());
  
  await act(async () => {
    await result.current.sendMessage('Hello');
  });
  
  expect(result.current.messages.length).toBeGreaterThan(0);
});
```

## Performance Considerations

- Use memoization (React.memo, useMemo, useCallback) for expensive computations
- Implement virtualization for long message lists
- Optimize image handling and compression before upload
- Use streaming responses when possible

## Error Handling

Implement consistent error handling throughout the application:

```tsx
// Example error handling pattern
try {
  await sendMessage(message);
} catch (error) {
  console.error('Error sending message:', error);
  
  // User-facing error
  toast.error(
    error.message || 'Failed to send message. Please try again.'
  );
  
  // Additional recovery logic
}
```

## Best Practices

- Prefer functional components and hooks over class components
- Use TypeScript for all components and functions
- Create small, focused components (50 lines or less)
- Write comprehensive documentation for complex functions
- Use consistent naming conventions
- Implement proper error handling
- Follow accessibility best practices
- Write tests for critical functionality
