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
            return new Token_1.Token({ type: "EOF", value: 0 });
        }
        // Detect common tokens
        const char = this.source[this.position];
        switch (char) {
            case enums_1.CommonTokens.PLUS:
                this.position++;
                return new Token_1.Token({ type: "PLUS", value: 0 });
            case enums_1.CommonTokens.MINUS:
                this.position++;
                return new Token_1.Token({ type: "MINUS", value: 0 });
            case enums_1.CommonTokens.X:
                this.position++;
                return new Token_1.Token({ type: "X", value: 0 });
            case enums_1.CommonTokens.DIVIDE:
                this.position++;
                return new Token_1.Token({ type: "DIVIDE", value: 0 });
            default:
                break;
        }
        if ((0, utils_1.isDigit)(char)) {
            const digitSequence = this.extractDigitSequence();
            return new Token_1.Token({ type: "INT", value: Number(digitSequence) });
        }
        throw new Error(`Unknown token ${char}`);
    }
    selectNext() {
        this.next = this.extractToken();
    }
    fetchAndSelectNext() {
        this.selectNext();
        return this.next;
    }
}
exports.Tokenizer = Tokenizer;
