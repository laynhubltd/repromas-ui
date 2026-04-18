import { suggestSlug } from '@/features/tenant-discovery/utils/suggestSlug';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

/**
 * Property-Based Tests for tenant signup utilities
 * Validates: Requirements 8.1, 8.3
 */

describe('suggestSlug — property tests', () => {
  /**
   * Property 1: Idempotence
   * Validates: Requirements 8.1
   */
  it('P1: is idempotent — suggestSlug(suggestSlug(x)) === suggestSlug(x)', () => {
    fc.assert(
      fc.property(fc.string(), (x) => {
        expect(suggestSlug(suggestSlug(x))).toBe(suggestSlug(x));
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Output invariant
   * Validates: Requirements 8.3
   */
  it('P2: output always matches /^[a-z0-9-]*$/ or is empty string', () => {
    fc.assert(
      fc.property(fc.string(), (x) => {
        const result = suggestSlug(x);
        expect(result).toMatch(/^[a-z0-9-]*$/);
      }),
      { numRuns: 100 }
    );
  });
});
