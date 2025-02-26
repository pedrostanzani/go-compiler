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
            return new Token_1.Token({ type: enums_1.TokenType.EOF, value: 0 });
        }
        // Detect common tokens
        const char = this.source[this.position];
        switch (char) {
            case enums_1.TokenRepresentation.PLUS:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.PLUS, value: 0 });
            case enums_1.TokenRepresentation.MINUS:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.MINUS, value: 0 });
            case enums_1.TokenRepresentation.X:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.X, value: 0 });
            case enums_1.TokenRepresentation.DIVIDE:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.DIVIDE, value: 0 });
            case enums_1.TokenRepresentation.OPEN_PAR:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.OPEN_PAR, value: 0 });
            case enums_1.TokenRepresentation.CLOSE_PAR:
                this.position++;
                return new Token_1.Token({ type: enums_1.TokenType.CLOSE_PAR, value: 0 });
            default:
                break;
        }
        if ((0, utils_1.isDigit)(char)) {
            const digitSequence = this.extractDigitSequence();
            return new Token_1.Token({ type: enums_1.TokenType.INT, value: Number(digitSequence) });
        }
        throw new Error(`Unknown token ${char}`);
    }
    selectNext() {
        this.next = this.extractToken();
        return this.next;
    }
}
exports.Tokenizer = Tokenizer;
