import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({ name: 'restaurants', id: '1' }),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => <div>{element}</div>,
  BrowserRouter: ({ children }) => <div>{children}</div>
}), { virtual: true });

import App from './App';

test('renders Helper application branding', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Helper/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
