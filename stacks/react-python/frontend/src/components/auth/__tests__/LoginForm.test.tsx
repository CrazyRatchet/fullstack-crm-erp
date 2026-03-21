import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LoginForm from '../LoginForm';

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

jest.mock('expo-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();

  it('renders email field, password field and sign in button', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address')).toBeTruthy();
      expect(screen.getByText('Password is required')).toBeTruthy();
    });
  });

  it('shows error when email format is invalid', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.changeText(inputs[0], 'not-an-email');
    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email address')).toBeTruthy();
    });
  });

  it('calls onSubmit when form is valid', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const inputs = screen.getAllByDisplayValue('');
    fireEvent.changeText(inputs[0], 'test@example.com');
    fireEvent.changeText(inputs[1], 'password123');
    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit.mock.calls[0][0]).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
