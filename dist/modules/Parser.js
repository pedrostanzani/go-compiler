"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Tokenizer_1 = require("./Tokenizer");
const enums_1 = require("../lib/enums");
const PrePro_1 = require("./PrePro");
const Node_1 = require("./Node");
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
        // let result = 0;
        let nextToken = this.tokenizer.getNext();
        if (nextToken.getType() === enums_1.TokenType.INT) {
            // result = nextToken.getValue();
            const node = new Node_1.IntVal({ value: nextToken.getValue(), children: [] });
            this.tokenizer.selectNext();
            return node;
        }
        if (nextToken.getType() === enums_1.TokenType.PLUS) {
            this.tokenizer.selectNext();
            // result = this.parseFactor();
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.PLUS,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (nextToken.getType() === enums_1.TokenType.MINUS) {
            this.tokenizer.selectNext();
            // result = -this.parseFactor();
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.MINUS,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (nextToken.getType() === enums_1.TokenType.OPEN_PAR) {
            this.tokenizer.selectNext();
            // result = this.parseExpression();
            const node = this.parseExpression();
            nextToken = this.tokenizer.getNext();
            if (nextToken.getType() === enums_1.TokenType.CLOSE_PAR) {
                this.tokenizer.selectNext();
                return node;
            }
            else {
                this.throwUnexpectedToken();
            }
        }
        this.throwUnexpectedToken();
        return new Node_1.IntVal({ value: 0, children: [] });
    }
    static parseTerm() {
        // let result = this.parseFactor();
        let node = this.parseFactor();
        let nextToken = this.tokenizer.getNext();
        while (nextToken.type === enums_1.TokenType.X ||
            nextToken.type === enums_1.TokenType.DIVIDE) {
            if (nextToken.type === enums_1.TokenType.X) {
                nextToken = this.tokenizer.selectNext();
                // result *= this.parseFactor();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.X,
                    children: [node, this.parseFactor()],
                });
            }
            else {
                nextToken = this.tokenizer.selectNext();
                // result = Math.floor(result / this.parseFactor());
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.DIVIDE,
                    children: [node, this.parseFactor()],
                });
            }
            nextToken = this.tokenizer.getNext();
        }
        return node;
    }
    static parseExpression() {
        // let result = this.parseTerm();
        let node = this.parseTerm();
        let nextToken = this.tokenizer.getNext();
        while (nextToken.type === enums_1.TokenType.MINUS ||
            nextToken.type === enums_1.TokenType.PLUS) {
            if (nextToken.type === enums_1.TokenType.PLUS) {
                nextToken = this.tokenizer.selectNext();
                // result += this.parseTerm();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.PLUS,
                    children: [node, this.parseTerm()],
                });
            }
            else {
                nextToken = this.tokenizer.selectNext();
                // result -= this.parseTerm();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.MINUS,
                    children: [node, this.parseTerm()],
                });
            }
            nextToken = this.tokenizer.getNext();
        }
        return node;
    }
    static run(sourceCode) {
        this.tokenizer = new Tokenizer_1.Tokenizer({
            source: PrePro_1.PrePro.filter(sourceCode),
            position: 0,
        });
        let result = this.parseExpression();
        const nextToken = this.tokenizer.getNext();
        if (nextToken.getType() !== enums_1.TokenType.EOF) {
            throw new Error("Could not detect EOF.");
        }
        return result;
    }
}
exports.Parser = Parser;
