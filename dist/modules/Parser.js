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
        if (this.tokenizer.getNext().type === enums_1.TokenType.EOF) {
            throw new Error("Premature EOF.");
        }
        else
            throw new Error(errorMessage);
    }
    static parseFactor() {
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.INT) {
            const node = new Node_1.IntVal({
                value: this.tokenizer.getNext().getNumericValue(),
                children: [],
            });
            this.tokenizer.selectNext(35); // \n
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.IDENTIFIER) {
            const node = new Node_1.Identifier({ token: this.tokenizer.getNext() });
            this.tokenizer.selectNext(41); // )
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.PLUS) {
            this.tokenizer.selectNext(46);
            const node = new Node_1.UnOp({
                value: enums_1.TokenType.PLUS,
                children: [this.parseFactor()],
            });
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.MINUS) {
            this.tokenizer.selectNext(55);
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
            this.tokenizer.selectNext(64);
            const node = this.parseBooleanExpression();
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.CLOSE_PAR) {
                this.tokenizer.selectNext(68);
                return node;
            }
            else {
                this.throwUnexpectedToken();
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
            this.throwUnexpectedToken();
        }
        this.throwUnexpectedToken();
    }
    static parseTerm() {
        let node = this.parseFactor();
        while (this.tokenizer.getNext().type === enums_1.TokenType.X ||
            this.tokenizer.getNext().type === enums_1.TokenType.DIVIDE) {
            if (this.tokenizer.getNext().type === enums_1.TokenType.X) {
                this.tokenizer.selectNext(87);
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.X,
                    children: [node, this.parseFactor()],
                });
            }
            else {
                this.tokenizer.selectNext(93);
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
                this.tokenizer.selectNext(115);
                node = new Node_1.BinOp({
                    value: enums_1.TokenType.PLUS,
                    children: [node, this.parseTerm()],
                });
            }
            else {
                this.tokenizer.selectNext(121);
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
            this.tokenizer.selectNext(139); // =
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.ASSIGNMENT) {
                this.tokenizer.selectNext(141); // 3
                const expression = this.parseBooleanExpression();
                const assignment = new Node_1.Assignment({
                    children: [identifier, expression],
                });
                if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                    this.tokenizer.selectNext(148);
                    return assignment;
                }
            }
            this.throwUnexpectedToken();
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.PRINTLN) {
            this.tokenizer.selectNext(157); // (
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.OPEN_PAR) {
                this.tokenizer.selectNext(159); // pedro
                const print = new Node_1.Print({ children: [this.parseBooleanExpression()] });
                if (this.tokenizer.getNext().getType() === enums_1.TokenType.CLOSE_PAR) {
                    this.tokenizer.selectNext(); // \n
                    if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                        this.tokenizer.selectNext(165);
                        return print;
                    }
                }
            }
            this.throwUnexpectedToken();
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.WHILE) {
            this.tokenizer.selectNext();
            const booleanExpression = this.parseBooleanExpression();
            this.tokenizer.selectNext();
            const whileNode = new Node_1.While({
                children: [booleanExpression, this.parseBlock()],
            });
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                this.tokenizer.selectNext();
                return whileNode;
            }
            this.throwUnexpectedToken();
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.IF) {
            this.tokenizer.selectNext();
            const booleanExpression = this.parseBooleanExpression();
            this.tokenizer.selectNext();
            const ifBlock = this.parseBlock();
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.ELSE) {
                this.tokenizer.selectNext();
                const elseBlock = this.parseBlock();
                this.tokenizer.selectNext();
                if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                    return new Node_1.If({ children: [booleanExpression, ifBlock, elseBlock] });
                }
                else {
                    this.throwUnexpectedToken();
                }
            }
            else if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                this.tokenizer.selectNext();
                return new Node_1.If({ children: [booleanExpression, ifBlock] });
            }
            this.throwUnexpectedToken();
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
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
        this.throwUnexpectedToken();
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
