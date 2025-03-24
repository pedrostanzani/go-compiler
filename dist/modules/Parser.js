"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Tokenizer_1 = require("./Tokenizer");
const enums_1 = require("../lib/enums");
const PrePro_1 = require("./PrePro");
const Node_1 = require("./Node");
class Parser {
    static tokenizer;
    static throwUnexpectedToken(errorMessage = "Unexpected token.") {
        const nextToken = this.tokenizer.getNext();
        if (nextToken.type === enums_1.TokenType.EOF) {
            throw new Error("Premature EOF.");
        }
        else
            throw new Error(errorMessage);
    }
    static parseFactor() {
        let nextToken = this.tokenizer.getNext(); // 3
        if (nextToken.getType() === enums_1.TokenType.INT) {
            const node = new Node_1.IntVal({ value: nextToken.getNumericValue(), children: [] });
            this.tokenizer.selectNext(35); // \n
            return node;
        }
        if (nextToken.getType() === enums_1.TokenType.IDENTIFIER) {
            const node = new Node_1.Identifier({ token: nextToken });
            this.tokenizer.selectNext(41); // )
            return node;
        }
        if (nextToken.getType() === enums_1.TokenType.PLUS) {
            this.tokenizer.selectNext(46);
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.PLUS,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (nextToken.getType() === enums_1.TokenType.MINUS) {
            this.tokenizer.selectNext(55);
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.MINUS,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (nextToken.getType() === enums_1.TokenType.OPEN_PAR) {
            this.tokenizer.selectNext(64);
            const node = this.parseExpression();
            nextToken = this.tokenizer.getNext();
            if (nextToken.getType() === enums_1.TokenType.CLOSE_PAR) {
                this.tokenizer.selectNext(68);
                return node;
            }
            else {
                this.throwUnexpectedToken();
            }
        }
        this.throwUnexpectedToken();
    }
    static parseTerm() {
        let node = this.parseFactor();
        let nextToken = this.tokenizer.getNext(); // \n
        while (nextToken.type === enums_1.TokenType.X ||
            nextToken.type === enums_1.TokenType.DIVIDE) {
            if (nextToken.type === enums_1.TokenType.X) {
                nextToken = this.tokenizer.selectNext(87);
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.X,
                    children: [node, this.parseFactor()],
                });
            }
            else {
                nextToken = this.tokenizer.selectNext(93);
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
        let node = this.parseTerm();
        let nextToken = this.tokenizer.getNext(); // \n
        while (nextToken.type === enums_1.TokenType.MINUS ||
            nextToken.type === enums_1.TokenType.PLUS) {
            if (nextToken.type === enums_1.TokenType.PLUS) {
                nextToken = this.tokenizer.selectNext(115);
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.PLUS,
                    children: [node, this.parseTerm()],
                });
            }
            else {
                nextToken = this.tokenizer.selectNext(121);
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.MINUS,
                    children: [node, this.parseTerm()],
                });
            }
            nextToken = this.tokenizer.getNext();
        }
        return node;
    }
    static parseStatement() {
        let nextToken = this.tokenizer.getNext(); // pedro
        if (nextToken.getType() === enums_1.TokenType.IDENTIFIER) {
            const identifier = new Node_1.Identifier({ token: nextToken });
            nextToken = this.tokenizer.selectNext(139); // =
            if (nextToken.getType() === enums_1.TokenType.ASSIGNMENT) {
                nextToken = this.tokenizer.selectNext(141); // 3
                const expression = this.parseExpression();
                const assignment = new Node_1.Assignment({
                    children: [identifier, expression],
                });
                nextToken = this.tokenizer.getNext();
                if (nextToken.getType() === enums_1.TokenType.NEW_LINE) {
                    this.tokenizer.selectNext(148);
                    return assignment;
                }
            }
            this.throwUnexpectedToken();
        }
        if (nextToken.getType() === enums_1.TokenType.PRINTLN) {
            nextToken = this.tokenizer.selectNext(157); // (
            if (nextToken.getType() === enums_1.TokenType.OPEN_PAR) {
                nextToken = this.tokenizer.selectNext(159); // pedro
                const print = new Node_1.Print({ children: [this.parseExpression()] });
                nextToken = this.tokenizer.getNext(); // )
                if (nextToken.getType() === enums_1.TokenType.CLOSE_PAR) {
                    nextToken = this.tokenizer.selectNext(); // \n
                    if (nextToken.getType() === enums_1.TokenType.NEW_LINE) {
                        this.tokenizer.selectNext(165);
                        return print;
                    }
                }
            }
            this.throwUnexpectedToken();
        }
        if (nextToken.getType() === enums_1.TokenType.NEW_LINE) {
            this.tokenizer.selectNext(175);
            return new Node_1.NoOp();
        }
        this.throwUnexpectedToken();
    }
    static parseBlock() {
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.OPEN_BRAC) {
            this.tokenizer.selectNext(186); // \n
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                this.tokenizer.selectNext(188); // pedro
                const statements = [];
                while (this.tokenizer.getNext().getType() !== enums_1.TokenType.CLOSE_BRAC) {
                    statements.push(this.parseStatement());
                }
                this.tokenizer.selectNext(193);
                return new Node_1.Block({ children: statements });
            }
            else
                this.throwUnexpectedToken();
        }
        else {
            this.throwUnexpectedToken();
        }
        ;
        this.throwUnexpectedToken();
    }
    static run(sourceCode) {
        this.tokenizer = new Tokenizer_1.Tokenizer({
            source: PrePro_1.PrePro.filter(sourceCode),
            position: 0,
        });
        let result = this.parseBlock();
        const nextToken = this.tokenizer.getNext();
        if (nextToken.getType() !== enums_1.TokenType.EOF) {
            throw new Error("Could not detect EOF.");
        }
        return result;
    }
}
exports.Parser = Parser;
