import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home', () => {
  it('renders the default headline', () => {
    render(<Home />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
