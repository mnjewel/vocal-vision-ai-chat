
import { render, screen } from '@testing-library/react';
import MessageInput from '../chat/MessageInput';

describe('MessageInput', () => {
  test('renders correctly', () => {
    render(<MessageInput 
      onSendMessage={() => Promise.resolve()} 
      onFileSelected={() => {}}
      uploadedImage={null}
      isTyping={false}
      isSubmitting={false}
      streamingResponse={false}
      activeAPITab="groq"
      showAPIKeyInput={false}
    />);
    const inputElement = screen.getByPlaceholderText('Send a message...');
    expect(inputElement).toBeInTheDocument();
  });
});
