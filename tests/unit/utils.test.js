import { describe, it, expect } from 'vitest';
import { shuffleArray } from '../../utils.js';

describe('utils.js', () => {
  describe('shuffleArray', () => {
    it('should return an array with the same length', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray([...input]);
      expect(result).toHaveLength(input.length);
    });

    it('should contain the same elements', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffleArray([...input]);
      expect(result.sort()).toEqual(input.sort());
    });

    it('should shuffle elements (probabilistic)', () => {
        const input = Array.from({length: 100}, (_, i) => i);
        const result = shuffleArray([...input]);
        expect(result).not.toEqual(input);
    });
  });
});
