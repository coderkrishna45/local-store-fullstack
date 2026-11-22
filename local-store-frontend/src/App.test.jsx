import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from './App';
import api from './api';

vi.mock('./api', () => ({ default: { get: vi.fn() } }));

test('renders the storefront and reports an empty catalog', async () => {
  api.get.mockResolvedValue({ data: [] });
  render(<App />);
  expect(screen.getByRole('heading', { name: 'LocalStore' })).toBeInTheDocument();
  expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
});

test('lets shoppers retry a failed catalog request', async () => {
  api.get.mockRejectedValue(new Error('Unavailable'));
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent('The catalog is temporarily unavailable.');
  api.get.mockResolvedValue({ data: [] });
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText(/no products found/i)).toBeInTheDocument();
});
