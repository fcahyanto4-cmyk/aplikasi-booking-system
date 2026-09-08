import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency } from '../format';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const result = formatDate('2026-07-15');
    expect(result).toContain('2026');
  });
});

describe('formatCurrency', () => {
  it('should format number to IDR currency', () => {
    const result = formatCurrency(50000);
    expect(result).toContain('Rp');
  });
});
