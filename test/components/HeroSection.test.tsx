import React from 'react';
import { render } from '@testing-library/react';
import HeroSection from '../../src/components/HeroSection';
import { describe, expect, it } from 'vitest';

describe('HeroSection', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<HeroSection />);
    expect(asFragment()).toMatchSnapshot();
  });
});
