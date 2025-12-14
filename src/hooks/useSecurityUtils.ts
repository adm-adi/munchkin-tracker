import { useCallback, useRef } from 'react';

/**
 * Debounce hook - delays function execution until after wait period
 */
export function useDebounce<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedCallback = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        },
        [callback, delay]
    ) as T;

    return debouncedCallback;
}

/**
 * Throttle hook - limits function execution to once per wait period
 */
export function useThrottle<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
): T {
    const lastRunRef = useRef<number>(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const throttledCallback = useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now();
            const timeSinceLastRun = now - lastRunRef.current;

            if (timeSinceLastRun >= delay) {
                lastRunRef.current = now;
                callback(...args);
            } else if (!timeoutRef.current) {
                timeoutRef.current = setTimeout(() => {
                    lastRunRef.current = Date.now();
                    timeoutRef.current = null;
                    callback(...args);
                }, delay - timeSinceLastRun);
            }
        },
        [callback, delay]
    ) as T;

    return throttledCallback;
}

/**
 * Rate limiter hook - prevents spam clicking
 */
export function useRateLimiter(
    maxCalls: number = 3,
    windowMs: number = 1000
): { canProceed: () => boolean; reset: () => void } {
    const callsRef = useRef<number[]>([]);

    const canProceed = useCallback((): boolean => {
        const now = Date.now();
        // Remove calls outside the window
        callsRef.current = callsRef.current.filter(
            (time) => now - time < windowMs
        );

        if (callsRef.current.length < maxCalls) {
            callsRef.current.push(now);
            return true;
        }
        return false;
    }, [maxCalls, windowMs]);

    const reset = useCallback(() => {
        callsRef.current = [];
    }, []);

    return { canProceed, reset };
}

/**
 * Input validation utilities
 */
export function validatePlayerName(name: string): { valid: boolean; error?: string } {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'El nombre no puede estar vacío' };
    }
    if (trimmed.length < 2) {
        return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
    }
    if (trimmed.length > 20) {
        return { valid: false, error: 'El nombre no puede tener más de 20 caracteres' };
    }
    // Allow letters, numbers, spaces, and some special chars
    if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s\-_]+$/.test(trimmed)) {
        return { valid: false, error: 'El nombre contiene caracteres no permitidos' };
    }
    return { valid: true };
}

export function validateMonsterLevel(level: number): { valid: boolean; error?: string } {
    if (!Number.isInteger(level)) {
        return { valid: false, error: 'El nivel debe ser un número entero' };
    }
    if (level < 1) {
        return { valid: false, error: 'El nivel mínimo es 1' };
    }
    if (level > 30) {
        return { valid: false, error: 'El nivel máximo es 30' };
    }
    return { valid: true };
}

export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML/script tags
        .slice(0, 100); // Limit length
}
