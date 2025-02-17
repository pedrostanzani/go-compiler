"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDigit = isDigit;
const DIGITS = Array.from(String(1234567890));
function isDigit(char) {
    return DIGITS.includes(char);
}
