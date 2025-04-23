"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
const Token_1 = require("./Token");
const utils_1 = require("../lib/utils");
const enums_1 = require("../lib/enums");
class Tokenizer {
    source;
    position;
    next;
    constructor({ source, position }) {
        this.source = source;
        this.position = position;
        this.next = this.extractToken();
    }
    getNext() {
        return this.next;
    }
    skipWhitespace() {
        const char = this.source[this.position];
        if ((0, utils_1.isWhitespace)(char)) {
            this.position++;
            return this.skipWhitespace();
        }
    }
    extractIdentifierSequence() {
        let tokenValue = "";
        for (let i = this.position; i < this.source.length; i++) {
            const char = this.source[i];
            if ((0, utils_1.isValidIdentifierChar)(char)) {
                tokenValue += char;
                this.position++;
            }
            else
                break;
        }
        return tokenValue;
    }
    extractDigitSequence() {
        let tokenValue = "";
        for (let i = this.position; i < this.source.length; i++) {
            const char = this.source[i];
            if ((0, utils_1.isDigit)(char)) {
                tokenValue += char;
                this.position++;
            }
            else
                break;
        }
        return tokenValue;
    }
    extractToken() {
        // Skip all whitespace tokens recursively
        this.skipWhitespace();
        // Detect if the next token is EOF
        if (this.position >= this.source.length) {
            return new Token_1.Token({ type: enums_1.TokenType.EOF });
        }
        // Detect common tokens
        const char = this.source[this.position];
        let nextChar;
        switch (char) {
            case enums_1.TokenRepresentation.PLUS:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.PLUS });
            case enums_1.TokenRepresentation.MINUS:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.MINUS });
            case enums_1.TokenRepresentation.X:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.X });
            case enums_1.TokenRepresentation.DIVIDE:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.DIVIDE });
            case enums_1.TokenRepresentation.OPEN_PAR:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.OPEN_PAR });
            case enums_1.TokenRepresentation.CLOSE_PAR:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.CLOSE_PAR });
            case enums_1.TokenRepresentation.OPEN_BRAC:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.OPEN_BRAC });
            case enums_1.TokenRepresentation.CLOSE_BRAC:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.CLOSE_BRAC });
            case enums_1.TokenRepresentation.NEW_LINE:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.NEW_LINE });
            case enums_1.TokenRepresentation.NOT:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.NOT });
            case enums_1.TokenRepresentation.GREATER_THAN:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.GREATER_THAN });
            case enums_1.TokenRepresentation.LESS_THAN:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.LESS_THAN });
            // Compound tokens
            case enums_1.TokenRepresentation.ASSIGNMENT:
                this.position++;
                nextChar = this.source[this.position];
                if (nextChar === "=") {
                    this.position++;
                    return new Token_1.Token({ type: enums_1.TokenType.EQUALS });
                }
                else {
                    return new Token_1.Token({ type: enums_1.TokenType.ASSIGNMENT });
                }
            case enums_1.TokenRepresentation.AND.charAt(0):
                this.position++;
                nextChar = this.source[this.position];
                if (nextChar === enums_1.TokenRepresentation.AND.charAt(1)) {
                    this.position++;
                    return new Token_1.Token({ type: enums_1.TokenType.AND });
                }
                else {
                    throw new Error(`Unknown token ${char}`);
                }
            case enums_1.TokenRepresentation.OR.charAt(0):
                this.position++;
                nextChar = this.source[this.position];
                if (nextChar === enums_1.TokenRepresentation.OR.charAt(1)) {
                    this.position++;
                    return new Token_1.Token({ type: enums_1.TokenType.OR });
                }
                else {
                    throw new Error(`Unknown token ${char}`);
                }
            default:
                break;
        }
        if ((0, utils_1.isDigit)(char)) {
            const digitSequence = this.extractDigitSequence();
            return new Token_1.Token({ type: enums_1.TokenType.INT, value: Number(digitSequence) });
        }
        if ((0, utils_1.isAlpha)(char) || char === "_") {
            const identifierSequence = this.extractIdentifierSequence();
            switch (identifierSequence) {
                case enums_1.TokenRepresentation.PRINT:
                    return new Token_1.Token({ type: enums_1.TokenType.PRINTLN });
                case enums_1.TokenRepresentation.READ:
                    return new Token_1.Token({ type: enums_1.TokenType.READ });
                case enums_1.TokenRepresentation.IF:
                    return new Token_1.Token({ type: enums_1.TokenType.IF });
                case enums_1.TokenRepresentation.ELSE:
                    return new Token_1.Token({ type: enums_1.TokenType.ELSE });
                case enums_1.TokenRepresentation.WHILE:
                    return new Token_1.Token({ type: enums_1.TokenType.WHILE });
                default:
                    return new Token_1.Token({
                        type: enums_1.TokenType.IDENTIFIER,
                        value: identifierSequence,
                    });
            }
        }
        throw new Error(`Unknown token ${char}`);
    }
    selectNext(lineNumber = -1) {
        this.next = this.extractToken();
    }
}
exports.Tokenizer = Tokenizer;
