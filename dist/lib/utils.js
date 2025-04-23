"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDigit = isDigit;
exports.isAlpha = isAlpha;
exports.isValidIdentifierChar = isValidIdentifierChar;
exports.isWhitespace = isWhitespace;
const DIGITS = Array.from(String(1234567890));
function isDigit(char) {
    return DIGITS.includes(char);
}
function isAlpha(char) {
    return /^[A-Za-z]$/.test(char);
}
function isValidIdentifierChar(char) {
    return /^[A-Za-z0-9_]$/.test(char);
}
function isWhitespace(char) {
    return char === " " || char === "\t";
}
