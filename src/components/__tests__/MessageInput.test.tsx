
import { render, screen } from '@testing-library/react';
import MessageInput from '../chat/MessageInput';

describe('MessageInput', () => {
  test('renders correctly', () => {
    render(<MessageInput onSendMessage={() => {}} onFileSelected={() => {}} />);
    const inputElement = screen.getByPlaceholderText('Send a message...');
    expect(inputElement).toBeInTheDocument();
  });
});
