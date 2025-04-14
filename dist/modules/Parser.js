"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Tokenizer_1 = require("./Tokenizer");
const enums_1 = require("../lib/enums");
const PrePro_1 = require("./PrePro");
const Node_1 = require("./Node");
const utils_1 = require("../lib/utils");
class Parser {
    static tokenizer;
    static throwUnexpectedToken(errorMessage = "Unexpected token.", line = -1) {
        if (line !== -1) {
            // console.log(line);
        }
        if (this.tokenizer.getNext().type === enums_1.TokenType.EOF) {
            throw new Error("Premature EOF.");
        }
        else
            throw new Error(errorMessage);
    }
    static parseFactor() {
        let nextToken = this.tokenizer.getNext(); // 3
        if (nextToken.getType() === enums_1.TokenType.INT) {
            const node = new Node_1.IntVal({
                value: nextToken.getNumericValue(),
                children: [],
            });
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
        if (nextToken.getType() === enums_1.TokenType.MINUS) {
            this.tokenizer.selectNext();
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.NOT,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (nextToken.getType() === enums_1.TokenType.OPEN_PAR) {
            this.tokenizer.selectNext(64);
            const node = this.parseBooleanExpression();
            nextToken = this.tokenizer.getNext();
            if (nextToken.getType() === enums_1.TokenType.CLOSE_PAR) {
                this.tokenizer.selectNext(68);
                return node;
            }
            else {
                this.throwUnexpectedToken("Unexpected token.", 91);
            }
        }
        if (nextToken.getType() === enums_1.TokenType.READ) {
            nextToken = this.tokenizer.selectNext();
            if (nextToken.getType() === enums_1.TokenType.OPEN_PAR) {
                nextToken = this.tokenizer.selectNext();
                if (nextToken.getType() === enums_1.TokenType.CLOSE_PAR) {
                    this.tokenizer.selectNext();
                    return new Node_1.Scan();
                }
                else {
                    this.throwUnexpectedToken("Unexpected token.", 103);
                }
            }
            else {
                this.throwUnexpectedToken("Unexpected token.", 106);
            }
        }
        this.throwUnexpectedToken("Unexpected token.", 110);
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
    static parseRelationalExpression() {
        let node = this.parseExpression();
        let nextToken = this.tokenizer.getNext();
        while (nextToken.type === enums_1.TokenType.EQUALS ||
            nextToken.type === enums_1.TokenType.GREATER_THAN ||
            nextToken.type === enums_1.TokenType.LESS_THAN) {
            if (nextToken.type === enums_1.TokenType.EQUALS) {
                nextToken = this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.EQUALS,
                    children: [node, this.parseExpression()],
                });
            }
            else if (nextToken.type === enums_1.TokenType.GREATER_THAN) {
                nextToken = this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.GREATER_THAN,
                    children: [node, this.parseExpression()],
                });
            }
            else {
                nextToken = this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.LESS_THAN,
                    children: [node, this.parseExpression()],
                });
            }
            nextToken = this.tokenizer.getNext();
        }
        return node;
    }
    static parseBooleanTerm() {
        let node = this.parseRelationalExpression();
        let nextToken = this.tokenizer.getNext();
        while (nextToken.type === enums_1.TokenType.AND) {
            nextToken = this.tokenizer.selectNext();
            node = new Node_1.BinOp({
                value: enums_1.TokenType.AND,
                children: [node, this.parseRelationalExpression()],
            });
            nextToken = this.tokenizer.getNext();
        }
        return node;
    }
    static parseBooleanExpression() {
        let node = this.parseBooleanTerm();
        let nextToken = this.tokenizer.getNext();
        while (nextToken.type === enums_1.TokenType.OR) {
            nextToken = this.tokenizer.selectNext();
            node = new Node_1.BinOp({
                value: enums_1.TokenType.OR,
                children: [node, this.parseBooleanTerm()],
            });
            nextToken = this.tokenizer.getNext();
        }
        return node;
    }
    static parseStatement() {
        let nextToken = this.tokenizer.getNext();
        if (nextToken.getType() === enums_1.TokenType.IDENTIFIER) {
            const identifier = new Node_1.Identifier({ token: nextToken });
            nextToken = this.tokenizer.selectNext(139);
            if (nextToken.getType() === enums_1.TokenType.ASSIGNMENT) {
                nextToken = this.tokenizer.selectNext(141);
                const expression = this.parseBooleanExpression();
                const assignment = new Node_1.Assignment({
                    children: [identifier, expression],
                });
                nextToken = this.tokenizer.getNext();
                if (nextToken.getType() === enums_1.TokenType.NEW_LINE) {
                    this.tokenizer.selectNext(148);
                    return assignment;
                }
            }
            this.throwUnexpectedToken("Unexpected token.", 258);
        }
        if (nextToken.getType() === enums_1.TokenType.PRINTLN) {
            nextToken = this.tokenizer.selectNext(157); // (
            if (nextToken.getType() === enums_1.TokenType.OPEN_PAR) {
                nextToken = this.tokenizer.selectNext(159); // pedro
                const print = new Node_1.Print({ children: [this.parseBooleanExpression()] });
                nextToken = this.tokenizer.getNext(); // )
                if (nextToken.getType() === enums_1.TokenType.CLOSE_PAR) {
                    nextToken = this.tokenizer.selectNext(); // \n
                    if (nextToken.getType() === enums_1.TokenType.NEW_LINE) {
                        this.tokenizer.selectNext(165);
                        return print;
                    }
                }
            }
            this.throwUnexpectedToken("Unexpected token.", 276);
        }
        if (nextToken.getType() === enums_1.TokenType.WHILE) {
            nextToken = this.tokenizer.selectNext();
            return new Node_1.While({
                children: [this.parseBooleanExpression(), this.parseBlock()],
            });
        }
        if (nextToken.getType() === enums_1.TokenType.IF) {
            nextToken = this.tokenizer.selectNext();
            const condition = this.parseBooleanExpression();
            const ifBlock = this.parseBlock();
            nextToken = this.tokenizer.selectNext();
            const elseBlock = nextToken.getType() === enums_1.TokenType.ELSE ? this.parseBlock() : null;
            const children = [condition, ifBlock];
            if ((0, utils_1.isTruthy)(elseBlock)) {
                children.push(elseBlock);
            }
            return new Node_1.If({ children });
        }
        if (nextToken.getType() === enums_1.TokenType.NEW_LINE) {
            this.tokenizer.selectNext(175);
            return new Node_1.NoOp();
        }
        this.throwUnexpectedToken("Unexpected token.", 306);
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
                this.throwUnexpectedToken("Unexpected token.", 320);
        }
        else {
            this.throwUnexpectedToken("Unexpected token.", 322);
        }
        this.throwUnexpectedToken("Unexpected token.", 325);
    }
    static run(sourceCode) {
        this.tokenizer = new Tokenizer_1.Tokenizer({
            source: PrePro_1.PrePro.filter(sourceCode),
            position: 0,
        });
        let result = this.parseBlock();
        if (this.tokenizer.getNext().getType() !== enums_1.TokenType.EOF) {
            throw new Error("Could not detect EOF.");
        }
        return result;
    }
}
exports.Parser = Parser;
