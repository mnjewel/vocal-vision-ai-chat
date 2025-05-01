
import { render, screen } from '@testing-library/react';
import MessageInput from '../chat/MessageInput';

describe('MessageInput', () => {
  test('renders correctly', () => {
    render(<MessageInput 
      onSendMessage={() => Promise.resolve()} 
      onFileSelected={() => {}} 
    />);
    const inputElement = screen.getByPlaceholderText('Send a message...');
    expect(inputElement).toBeInTheDocument();
  });
});
