"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Tokenizer_1 = require("./Tokenizer");
class Parser {
    static tokenizer;
    static parseExpression() {
        let result = 0;
        let nextToken;
        nextToken = this.tokenizer.getNext();
        if (nextToken.getType() === "INT") {
            result = nextToken.getValue();
            this.tokenizer.selectNext();
            nextToken = this.tokenizer.getNext();
            while (nextToken.type === "MINUS" || nextToken.type === "PLUS") {
                if (nextToken.type === "PLUS") {
                    this.tokenizer.selectNext();
                    nextToken = this.tokenizer.getNext();
                    if (nextToken.type === "INT") {
                        result += nextToken.value;
                    }
                    else {
                        throw new Error("Could not parse expression.");
                    }
                }
                else {
                    this.tokenizer.selectNext();
                    nextToken = this.tokenizer.getNext();
                    if (nextToken.type === "INT") {
                        result -= nextToken.value;
                    }
                    else {
                        throw new Error("Could not parse expression.");
                    }
                }
                this.tokenizer.selectNext();
                nextToken = this.tokenizer.getNext();
            }
            if (nextToken.getType() !== "EOF") {
                throw new Error("Extra input after valid expression.");
            }
            return result;
        }
        else {
            throw new Error("Could not parse expression.");
        }
    }
    static run(sourceCode) {
        this.tokenizer = new Tokenizer_1.Tokenizer({ source: sourceCode, position: 0 });
        return this.parseExpression();
    }
}
exports.Parser = Parser;
