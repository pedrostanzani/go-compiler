"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDigit = isDigit;
exports.isWhitespace = isWhitespace;
const DIGITS = Array.from(String(1234567890));
function isDigit(char) {
    return DIGITS.includes(char);
}
function isWhitespace(char) {
    return char === " ";
}
