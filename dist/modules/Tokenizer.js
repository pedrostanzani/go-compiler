"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
const utils_1 = require("../lib/utils");
const Token_1 = require("./Token");
class Tokenizer {
    source;
    position;
    next;
    constructor({ source, position }) {
        this.source = source;
        this.position = position;
        this.next = this.extractNextTokenFromSource();
    }
    getSource() {
        return this.source;
    }
    getPosition() {
        return this.position;
    }
    getNext() {
        return this.next;
    }
    skipWhitespace() {
        const char = this.source[this.position];
        if (char === " ") {
            this.position++;
            return this.skipWhitespace();
        }
    }
    extractNextTokenFromSource() {
        if (this.position >= this.source.length) {
            return new Token_1.Token({ type: "EOF", value: 0 });
        }
        // Skip whitespace characters
        this.skipWhitespace();
        const char = this.source[this.position];
        if (char === "+") {
            this.position++;
            return new Token_1.Token({ type: "PLUS", value: 0 });
        }
        if (char === "-") {
            this.position++;
            return new Token_1.Token({ type: "MINUS", value: 0 });
        }
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
        if (tokenValue.trim() === "") {
            throw new Error("Invalid input.");
        }
        return new Token_1.Token({ type: "INT", value: Number(tokenValue) });
    }
    selectNext() {
        this.next = this.extractNextTokenFromSource();
    }
}
exports.Tokenizer = Tokenizer;
