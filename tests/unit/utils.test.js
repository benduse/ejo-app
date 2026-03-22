import { describe, it, expect } from 'vitest';
import { shuffleArray } from '../../utils.js';

describe('utils', () => {
    describe('shuffleArray', () => {
        it('should shuffle an array', () => {
            const input = [1, 2, 3, 4, 5];
            const output = shuffleArray([...input]);
            expect(output).toHaveLength(input.length);
            expect(output).toEqual(expect.arrayContaining(input));
            // Note: technically shuffle can return the same order, but for 5 elements it's unlikely
        });
    });
});
