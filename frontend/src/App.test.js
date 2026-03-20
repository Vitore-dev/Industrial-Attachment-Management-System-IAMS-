import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '#login';
});

test('renders the sprint 1 login experience', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByText(/frontend demo mode/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
});

test('switches register fields between student and organization flows', async () => {
  window.location.hash = '#register';
  render(<App />);

  expect(screen.getByLabelText(/student number/i)).toBeInTheDocument();

  await userEvent.click(screen.getAllByRole('button', { name: /organization/i })[0]);

  expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
  expect(screen.getByText(/preferred student skills/i)).toBeInTheDocument();
});
