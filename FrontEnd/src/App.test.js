import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ronaldo\'s Rentals app', () => {
  render(<App />);
  const titleElement = screen.getByText(/Ronaldo's Rentals/i);
  expect(titleElement).toBeInTheDocument();
});
