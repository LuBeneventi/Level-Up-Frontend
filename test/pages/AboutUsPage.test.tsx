import React from 'react';
import { render } from '@testing-library/react';
import AboutUsPage from '../../src/pages/AboutUsPage';
import { describe, expect, it } from 'vitest';

describe('AboutUsPage', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<AboutUsPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
