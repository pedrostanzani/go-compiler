"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Tokenizer_1 = require("./Tokenizer");
const enums_1 = require("../lib/enums");
class Parser {
    static tokenizer;
    static throwUnexpectedToken() {
        const nextToken = this.tokenizer.getNext();
        if (nextToken.type === enums_1.TokenType.EOF) {
            throw new Error("Premature EOF.");
        }
        else
            throw new Error("Unexpected non-integer token.");
    }
    static parseFactor() {
        let result = 0;
        let nextToken = this.tokenizer.getNext();
        if (nextToken.getType() === enums_1.TokenType.INT) {
            result = nextToken.getValue();
            this.tokenizer.selectNext();
            return result;
        }
        if (nextToken.getType() === enums_1.TokenType.PLUS) {
            this.tokenizer.selectNext();
            result = this.parseFactor();
            return result;
        }
        if (nextToken.getType() === enums_1.TokenType.MINUS) {
            this.tokenizer.selectNext();
            result = -this.parseFactor();
            return result;
        }
        if (nextToken.getType() === enums_1.TokenType.OPEN_PAR) {
            this.tokenizer.selectNext();
            result = this.parseExpression();
            nextToken = this.tokenizer.getNext();
            if (nextToken.getType() === enums_1.TokenType.CLOSE_PAR) {
                this.tokenizer.selectNext();
                return result;
            }
            else {
                this.throwUnexpectedToken();
            }
        }
        this.throwUnexpectedToken();
        return result;
    }
    static parseTerm() {
        let result = this.parseFactor();
        let nextToken = this.tokenizer.getNext();
        while (nextToken.type === enums_1.TokenType.X ||
            nextToken.type === enums_1.TokenType.DIVIDE) {
            if (nextToken.type === enums_1.TokenType.X) {
                nextToken = this.tokenizer.selectNext();
                result *= this.parseTerm();
            }
            else {
                nextToken = this.tokenizer.selectNext();
                result = Math.floor(result / nextToken.value);
            }
            nextToken = this.tokenizer.getNext();
        }
        return result;
    }
    static parseExpression() {
        let result = this.parseTerm();
        let nextToken = this.tokenizer.getNext();
        while (nextToken.type === enums_1.TokenType.MINUS ||
            nextToken.type === enums_1.TokenType.PLUS) {
            if (nextToken.type === enums_1.TokenType.PLUS) {
                nextToken = this.tokenizer.selectNext();
                result += this.parseTerm();
            }
            else {
                nextToken = this.tokenizer.selectNext();
                result -= this.parseTerm();
            }
            nextToken = this.tokenizer.getNext();
        }
        return result;
    }
    static run(sourceCode) {
        this.tokenizer = new Tokenizer_1.Tokenizer({ source: sourceCode, position: 0 });
        let result = this.parseExpression();
        const nextToken = this.tokenizer.getNext();
        if (nextToken.getType() !== enums_1.TokenType.EOF) {
            throw new Error("Could not detect EOF.");
        }
        return result;
    }
}
exports.Parser = Parser;
