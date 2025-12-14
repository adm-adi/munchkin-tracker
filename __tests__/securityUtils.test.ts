import { sanitizeInput, validateMonsterLevel, validatePlayerName } from '../src/hooks/useSecurityUtils';

describe('Security Utils', () => {
    describe('validatePlayerName', () => {
        it('should accept valid names', () => {
            expect(validatePlayerName('Juan')).toEqual({ valid: true });
            expect(validatePlayerName('María García')).toEqual({ valid: true });
            expect(validatePlayerName('Player-1')).toEqual({ valid: true });
        });

        it('should reject empty names', () => {
            expect(validatePlayerName('')).toEqual({ valid: false, error: 'El nombre no puede estar vacío' });
            expect(validatePlayerName('   ')).toEqual({ valid: false, error: 'El nombre no puede estar vacío' });
        });

        it('should reject short names', () => {
            expect(validatePlayerName('A')).toEqual({ valid: false, error: 'El nombre debe tener al menos 2 caracteres' });
        });

        it('should reject long names', () => {
            const longName = 'A'.repeat(21);
            expect(validatePlayerName(longName)).toEqual({ valid: false, error: 'El nombre no puede tener más de 20 caracteres' });
        });

        it('should reject invalid characters', () => {
            expect(validatePlayerName('Player<script>')).toEqual({ valid: false, error: 'El nombre contiene caracteres no permitidos' });
        });
    });

    describe('validateMonsterLevel', () => {
        it('should accept valid levels', () => {
            expect(validateMonsterLevel(1)).toEqual({ valid: true });
            expect(validateMonsterLevel(15)).toEqual({ valid: true });
            expect(validateMonsterLevel(30)).toEqual({ valid: true });
        });

        it('should reject non-integer levels', () => {
            expect(validateMonsterLevel(1.5)).toEqual({ valid: false, error: 'El nivel debe ser un número entero' });
        });

        it('should reject levels below 1', () => {
            expect(validateMonsterLevel(0)).toEqual({ valid: false, error: 'El nivel mínimo es 1' });
            expect(validateMonsterLevel(-5)).toEqual({ valid: false, error: 'El nivel mínimo es 1' });
        });

        it('should reject levels above 30', () => {
            expect(validateMonsterLevel(31)).toEqual({ valid: false, error: 'El nivel máximo es 30' });
        });
    });

    describe('sanitizeInput', () => {
        it('should trim whitespace', () => {
            expect(sanitizeInput('  hello  ')).toBe('hello');
        });

        it('should remove HTML tags', () => {
            expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
        });

        it('should limit length to 100 characters', () => {
            const longInput = 'A'.repeat(150);
            expect(sanitizeInput(longInput).length).toBe(100);
        });
    });
});
