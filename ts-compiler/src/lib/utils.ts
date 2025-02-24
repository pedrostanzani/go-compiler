const DIGITS = Array.from(String(1234567890));

export function isDigit(char: string) {
  return DIGITS.includes(char);
}

export function isWhitespace(char: string) {
  return char === " ";
}
