"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Tokenizer_1 = require("./Tokenizer");
const enums_1 = require("../lib/enums");
const PrePro_1 = require("./PrePro");
const debug_1 = require("../lib/debug");
const Node_1 = require("./Node");
class Parser {
    static tokenizer;
    static throwUnexpectedToken({ fn, details, errorMessage = "Unexpected token.", }) {
        if (this.tokenizer.getNext().type === enums_1.TokenType.EOF) {
            throw new Error("Premature EOF.");
        }
        else {
            debug_1.Debug.log(`Current position: ${this.tokenizer.position}`);
            debug_1.Debug.log(`Next token: ${this.tokenizer.getNext().getType()}`);
            debug_1.Debug.log(`Raw source code:`);
            debug_1.Debug.log(`---`);
            debug_1.Debug.log(this.tokenizer.source);
            debug_1.Debug.log(`---`);
            debug_1.Debug.log(`Error thown from: ${fn}`);
            debug_1.Debug.log(`Details: ${details}`);
            throw new Error(errorMessage);
        }
    }
    static parseFactor() {
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.INT) {
            const node = new Node_1.IntVal({
                value: this.tokenizer.getNext().getNumericValue(),
                children: [],
            });
            this.tokenizer.selectNext();
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.IDENTIFIER) {
            const node = new Node_1.Identifier({ token: this.tokenizer.getNext() });
            this.tokenizer.selectNext();
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.PLUS) {
            this.tokenizer.selectNext();
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.PLUS,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.MINUS) {
            this.tokenizer.selectNext();
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.MINUS,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.NOT) {
            this.tokenizer.selectNext();
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.NOT,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.OPEN_PAR) {
            this.tokenizer.selectNext();
            const node = this.parseBooleanExpression();
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.CLOSE_PAR) {
                this.tokenizer.selectNext();
                return node;
            }
            else {
                this.throwUnexpectedToken({
                    fn: "parseFactor",
                    details: "OPEN_PAR",
                });
            }
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.READ) {
            this.tokenizer.selectNext();
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.OPEN_PAR) {
                this.tokenizer.selectNext();
                if (this.tokenizer.getNext().getType() === enums_1.TokenType.CLOSE_PAR) {
                    this.tokenizer.selectNext();
                    return new Node_1.Scan();
                }
            }
            this.throwUnexpectedToken({
                fn: "parseFactor",
                details: "READ",
            });
        }
        this.throwUnexpectedToken({
            fn: "parseFactor",
            details: "ESCAPE",
        });
    }
    static parseTerm() {
        let node = this.parseFactor();
        while (this.tokenizer.getNext().type === enums_1.TokenType.X ||
            this.tokenizer.getNext().type === enums_1.TokenType.DIVIDE) {
            if (this.tokenizer.getNext().type === enums_1.TokenType.X) {
                this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.X,
                    children: [node, this.parseFactor()],
                });
            }
            else {
                this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.DIVIDE,
                    children: [node, this.parseFactor()],
                });
            }
        }
        return node;
    }
    static parseExpression() {
        let node = this.parseTerm();
        while (this.tokenizer.getNext().type === enums_1.TokenType.MINUS ||
            this.tokenizer.getNext().type === enums_1.TokenType.PLUS) {
            if (this.tokenizer.getNext().type === enums_1.TokenType.PLUS) {
                this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.PLUS,
                    children: [node, this.parseTerm()],
                });
            }
            else {
                this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.MINUS,
                    children: [node, this.parseTerm()],
                });
            }
        }
        return node;
    }
    static parseRelationalExpression() {
        let node = this.parseExpression();
        while (this.tokenizer.getNext().type === enums_1.TokenType.EQUALS ||
            this.tokenizer.getNext().type === enums_1.TokenType.GREATER_THAN ||
            this.tokenizer.getNext().type === enums_1.TokenType.LESS_THAN) {
            if (this.tokenizer.getNext().type === enums_1.TokenType.EQUALS) {
                this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.EQUALS,
                    children: [node, this.parseExpression()],
                });
            }
            else if (this.tokenizer.getNext().type === enums_1.TokenType.GREATER_THAN) {
                this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.GREATER_THAN,
                    children: [node, this.parseExpression()],
                });
            }
            else {
                this.tokenizer.selectNext();
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.LESS_THAN,
                    children: [node, this.parseExpression()],
                });
            }
        }
        return node;
    }
    static parseBooleanTerm() {
        let node = this.parseRelationalExpression();
        while (this.tokenizer.getNext().type === enums_1.TokenType.AND) {
            this.tokenizer.selectNext();
            node = new Node_1.BinOp({
                value: enums_1.TokenType.AND,
                children: [node, this.parseRelationalExpression()],
            });
        }
        return node;
    }
    static parseBooleanExpression() {
        let node = this.parseBooleanTerm();
        while (this.tokenizer.getNext().type === enums_1.TokenType.OR) {
            this.tokenizer.selectNext();
            node = new Node_1.BinOp({
                value: enums_1.TokenType.OR,
                children: [node, this.parseBooleanTerm()],
            });
        }
        return node;
    }
    static parseStatement() {
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.IDENTIFIER) {
            const identifier = new Node_1.Identifier({ token: this.tokenizer.getNext() });
            this.tokenizer.selectNext();
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.ASSIGNMENT) {
                this.tokenizer.selectNext();
                const expression = this.parseBooleanExpression();
                const assignment = new Node_1.Assignment({
                    children: [identifier, expression],
                });
                if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                    this.tokenizer.selectNext();
                    return assignment;
                }
            }
            this.throwUnexpectedToken({
                fn: "parseStatement",
                details: "IDENTIFIER",
            });
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.PRINTLN) {
            this.tokenizer.selectNext();
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.OPEN_PAR) {
                this.tokenizer.selectNext();
                const print = new Node_1.Print({ children: [this.parseBooleanExpression()] });
                if (this.tokenizer.getNext().getType() === enums_1.TokenType.CLOSE_PAR) {
                    this.tokenizer.selectNext();
                    if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                        this.tokenizer.selectNext();
                        return print;
                    }
                }
            }
            this.throwUnexpectedToken({
                fn: "parseStatement",
                details: "PRINTLN",
            });
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.WHILE) {
            this.tokenizer.selectNext();
            const booleanExpression = this.parseBooleanExpression();
            // this.tokenizer.selectNext();
            const whileNode = new Node_1.While({
                children: [booleanExpression, this.parseBlock()],
            });
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                this.tokenizer.selectNext();
                return whileNode;
            }
            this.throwUnexpectedToken({
                fn: "parseStatement",
                details: "WHILE",
            });
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.IF) {
            this.tokenizer.selectNext();
            const booleanExpression = this.parseBooleanExpression();
            // this.tokenizer.selectNext();
            const ifBlock = this.parseBlock();
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.ELSE) {
                this.tokenizer.selectNext();
                const elseBlock = this.parseBlock();
                // this.tokenizer.selectNext();
                if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                    return new Node_1.If({ children: [booleanExpression, ifBlock, elseBlock] });
                }
                else {
                    this.throwUnexpectedToken({
                        fn: "parseStatement",
                        details: "ELSE/NEW_LINE",
                    });
                }
            }
            else if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                this.tokenizer.selectNext();
                return new Node_1.If({ children: [booleanExpression, ifBlock] });
            }
            this.throwUnexpectedToken({
                fn: "parseStatement",
                details: "IF",
            });
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
            this.tokenizer.selectNext();
            return new Node_1.NoOp();
        }
        this.throwUnexpectedToken({
            fn: "parseStatement",
            details: "ESCAPE",
        });
    }
    static parseBlock() {
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.OPEN_BRAC) {
            this.tokenizer.selectNext();
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                this.tokenizer.selectNext();
                const statements = [];
                while (this.tokenizer.getNext().getType() !== enums_1.TokenType.CLOSE_BRAC) {
                    statements.push(this.parseStatement());
                }
                this.tokenizer.selectNext();
                return new Node_1.Block({ children: statements });
            }
            else
                this.throwUnexpectedToken({
                    fn: "parseBlock",
                    details: "NEW_LINE",
                });
        }
        else {
            this.throwUnexpectedToken({
                fn: "parseBlock",
                details: "ESCAPE",
            });
        }
    }
    static run(sourceCode) {
        this.tokenizer = new Tokenizer_1.Tokenizer({
            source: PrePro_1.PrePro.filter(sourceCode),
            position: 0,
        });
        let result = this.parseBlock();
        // Each parsing function should make sure that the next token is 'ready to go'
        // So if run() calls
        //  --> parseBlock()
        // By the time the parseBlock function execution ends, the nextToken should be whatever
        // comes after parseBlock in the diagram
        if (this.tokenizer.getNext().getType() !== enums_1.TokenType.EOF) {
            throw new Error("Could not detect EOF.");
        }
        return result;
    }
}
exports.Parser = Parser;
