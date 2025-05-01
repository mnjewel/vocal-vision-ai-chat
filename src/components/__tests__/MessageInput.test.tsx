
// Remove unused React import
import { render, screen } from '@testing-library/react';
import MessageInput from '../components/MessageInput';

describe('MessageInput', () => {
  test('renders correctly', () => {
    render(<MessageInput onSend={() => {}} />);
    const inputElement = screen.getByPlaceholderText('Type a message...');
    expect(inputElement).toBeInTheDocument();
  });
});
