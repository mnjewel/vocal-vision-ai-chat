import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessageInput from '@/components/chat/MessageInput';

// Mock the hasGroqKey function
jest.mock('@/integrations/groq/client', () => ({
  hasGroqKey: jest.fn().mockReturnValue(true),
}));

describe('MessageInput Component', () => {
  const mockProps = {
    onSendMessage: jest.fn().mockResolvedValue(undefined),
    onFileSelected: jest.fn(),
    uploadedImage: null,
    isTyping: false,
    isSubmitting: false,
    streamingResponse: false,
    activeAPITab: 'groq',
    showAPIKeyInput: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<MessageInput {...mockProps} />);
    
    // Check if the textarea is rendered
    expect(screen.getByPlaceholderText('Send a message...')).toBeInTheDocument();
    
    // Check if the send button is rendered
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('handles text input correctly', () => {
    render(<MessageInput {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Send a message...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });
    
    expect(textarea).toHaveValue('Hello, world!');
  });

  test('calls onSendMessage when send button is clicked', async () => {
    render(<MessageInput {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Send a message...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockProps.onSendMessage).toHaveBeenCalledWith('Hello, world!', undefined);
    });
  });

  test('calls onSendMessage when Enter is pressed', async () => {
    render(<MessageInput {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Send a message...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });
    
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(mockProps.onSendMessage).toHaveBeenCalledWith('Hello, world!', undefined);
    });
  });

  test('does not call onSendMessage when Shift+Enter is pressed', async () => {
    render(<MessageInput {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Send a message...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });
    
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    await waitFor(() => {
      expect(mockProps.onSendMessage).not.toHaveBeenCalled();
    });
  });

  test('disables send button when input is empty', () => {
    render(<MessageInput {...mockProps} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  test('enables send button when there is input', () => {
    render(<MessageInput {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Send a message...');
    fireEvent.change(textarea, { target: { value: 'Hello, world!' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });
});
