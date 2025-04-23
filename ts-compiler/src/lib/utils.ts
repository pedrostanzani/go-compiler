const DIGITS = Array.from(String(1234567890));

export function isDigit(char: string) {
  return DIGITS.includes(char);
}

export function isAlpha(char: string): boolean {
  return /^[A-Za-z]$/.test(char);
}

export function isValidIdentifierChar(char: string): boolean {
  return /^[A-Za-z0-9_]$/.test(char);
}

export function isWhitespace(char: string) {
  return char === " " || char === "\t";
}

type Falsy = false | 0 | "" | null | undefined;

export function isTruthy<T>(value: T): value is Exclude<T, Falsy> {
  return Boolean(value);
}
