import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryPill } from '../ui/CategoryPill';

describe('CategoryPill', () => {
  it('renders children correctly', () => {
    render(<CategoryPill>Test Category</CategoryPill>);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('applies active styles when active prop is true', () => {
    render(<CategoryPill active>Active Category</CategoryPill>);
    const button = screen.getByText('Active Category');
    // Check for classes that are conditionally applied
    expect(button.className).toContain('bg-white/60');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<CategoryPill onClick={handleClick}>Click Me</CategoryPill>);

    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
