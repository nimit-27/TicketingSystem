import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test ensuring testing library works
it('renders without crashing', () => {
  render(<div>test</div>);
  expect(screen.getByText('test')).toBeInTheDocument();
});
