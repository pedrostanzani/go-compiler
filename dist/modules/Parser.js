"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Tokenizer_1 = require("./Tokenizer");
const enums_1 = require("../lib/enums");
const PrePro_1 = require("./PrePro");
const debug_1 = require("../lib/debug");
const Node_1 = require("./Node");
const utils_1 = require("../lib/utils");
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
    static readSequential({ throwErrorOnFirstItem = true, ...sequence }) {
        const itemsStore = [];
        for (let i = 0; i < sequence.items.length; i++) {
            const item = sequence.items[i];
            if (typeof item === "string") {
                if (this.tokenizer.getNext().getType() === item) {
                    itemsStore.push(this.tokenizer.getNext());
                    this.tokenizer.selectNext();
                    continue;
                }
                else if (i === 0 && !throwErrorOnFirstItem) {
                    return null;
                }
                else {
                    this.throwUnexpectedToken(sequence.errorDetails ?? {
                        fn: "readSequential",
                        details: "GENERIC",
                    });
                }
            }
            else if (typeof item === "function") {
                const node = item.call(this);
                itemsStore.push(node);
            }
            else {
                throw new Error("Invalid sequence.");
            }
        }
        return sequence.onFinish(itemsStore);
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
            const identifierToken = this.tokenizer.getNext();
            const identifierNode = new Node_1.Identifier({ token: identifierToken });
            this.tokenizer.selectNext();
            if (this.tokenizer.getNext().getType() !== enums_1.TokenType.OPEN_PAR) {
                return identifierNode;
            }
            this.tokenizer.selectNext();
            const args = [];
            if (this.tokenizer.getNext().getType() !== enums_1.TokenType.CLOSE_PAR) {
                args.push(this.parseBooleanExpression());
                while (this.tokenizer.getNext().getType() === enums_1.TokenType.COMMA) {
                    this.tokenizer.selectNext();
                    args.push(this.parseBooleanExpression());
                }
            }
            if (this.tokenizer.getNext().getType() !== enums_1.TokenType.CLOSE_PAR) {
                this.throwUnexpectedToken({
                    fn: "parseStatement",
                    details: "IDENT/CLOSE_PAR",
                });
            }
            this.tokenizer.selectNext();
            return new Node_1.FuncCall({ children: args, value: identifierNode.value });
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.STRING) {
            const node = new Node_1.StringVal({
                value: this.tokenizer.getNext().getStringValue(),
            });
            this.tokenizer.selectNext();
            return node;
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.BOOL) {
            const node = new Node_1.BoolVal({
                value: this.tokenizer.getNext().getBooleanValue(),
            });
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
        let node;
        node = this.readSequential({
            items: [
                enums_1.TokenType.OPEN_PAR,
                this.parseBooleanExpression,
                enums_1.TokenType.CLOSE_PAR,
            ],
            onFinish: (itemsStore) => {
                return itemsStore[1];
            },
            throwErrorOnFirstItem: false,
            errorDetails: {
                fn: "parseFactor",
                details: "OPEN_PAR",
            },
        });
        if ((0, utils_1.isTruthy)(node))
            return node;
        node = this.readSequential({
            items: [enums_1.TokenType.READ, enums_1.TokenType.OPEN_PAR, enums_1.TokenType.CLOSE_PAR],
            onFinish: () => new Node_1.Scan(),
            throwErrorOnFirstItem: false,
            errorDetails: {
                fn: "parseFactor",
                details: "READ",
            },
        });
        if ((0, utils_1.isTruthy)(node))
            return node;
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
        let node;
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.IDENTIFIER) {
            const identifier = new Node_1.Identifier({ token: this.tokenizer.getNext() });
            this.tokenizer.selectNext();
            node = this.readSequential({
                items: [
                    enums_1.TokenType.ASSIGNMENT,
                    this.parseBooleanExpression,
                    enums_1.TokenType.NEW_LINE,
                ],
                onFinish: (itemsStore) => {
                    const [_, expression] = itemsStore;
                    return new Node_1.Assignment({
                        children: [identifier, expression],
                    });
                },
                throwErrorOnFirstItem: false,
                errorDetails: { fn: "parseStatement", details: "IDENTIFIER" },
            });
            if ((0, utils_1.isTruthy)(node))
                return node;
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.OPEN_PAR) {
                this.tokenizer.selectNext();
                const args = [];
                if (this.tokenizer.getNext().getType() !== enums_1.TokenType.CLOSE_PAR) {
                    args.push(this.parseBooleanExpression());
                    while (this.tokenizer.getNext().getType() === enums_1.TokenType.COMMA) {
                        this.tokenizer.selectNext();
                        args.push(this.parseBooleanExpression());
                    }
                }
                if (this.tokenizer.getNext().getType() !== enums_1.TokenType.CLOSE_PAR) {
                    this.throwUnexpectedToken({
                        fn: "parseStatement",
                        details: "IDENT/CLOSE_PAR",
                    });
                }
                this.tokenizer.selectNext();
                if (this.tokenizer.getNext().getType() !== enums_1.TokenType.NEW_LINE) {
                    this.throwUnexpectedToken({
                        fn: "parseStatement",
                        details: "IDENT/NEW_LINE",
                    });
                }
                this.tokenizer.selectNext();
                return new Node_1.FuncCall({ children: args, value: identifier.value });
            }
            else {
                this.throwUnexpectedToken({
                    fn: "parseStatement",
                    details: "IDENT/OPEN_PAR",
                });
            }
        }
        node = this.readSequential({
            items: [
                enums_1.TokenType.PRINTLN,
                enums_1.TokenType.OPEN_PAR,
                this.parseBooleanExpression,
                enums_1.TokenType.CLOSE_PAR,
                enums_1.TokenType.NEW_LINE,
            ],
            onFinish: (itemsStore) => {
                const booleanExpression = itemsStore[2];
                return new Node_1.Print({ children: [booleanExpression] });
            },
            throwErrorOnFirstItem: false,
            errorDetails: { fn: "parseStatement", details: "PRINTLN" },
        });
        if ((0, utils_1.isTruthy)(node))
            return node;
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.VAR) {
            const [identifier, typeToken] = this.readSequential({
                items: [enums_1.TokenType.VAR, enums_1.TokenType.IDENTIFIER, enums_1.TokenType.TYPE],
                onFinish: (itemsStore) => {
                    const [_, identifierToken, typeToken] = itemsStore;
                    return [new Node_1.Identifier({ token: identifierToken }), typeToken];
                },
                errorDetails: { fn: "parseStatement", details: "VAR" },
            });
            const node = this.readSequential({
                items: [enums_1.TokenType.ASSIGNMENT, this.parseBooleanExpression],
                onFinish: (itemsStore) => {
                    const expression = itemsStore[1];
                    return new Node_1.VarDec({
                        value: typeToken.getStringValue(),
                        children: [identifier, expression],
                    });
                },
                throwErrorOnFirstItem: false,
                errorDetails: { fn: "parseStatement", details: "VAR/ASSIGNMENT" },
            });
            if ((0, utils_1.isTruthy)(node))
                return node;
            return this.readSequential({
                items: [enums_1.TokenType.NEW_LINE],
                onFinish: () => new Node_1.VarDec({
                    value: typeToken.getStringValue(),
                    children: [identifier],
                }),
                errorDetails: { fn: "parseStatement", details: "IF/NEW_LINE" },
            });
        }
        node = this.readSequential({
            items: [
                enums_1.TokenType.WHILE,
                this.parseBooleanExpression,
                this.parseBlock,
                enums_1.TokenType.NEW_LINE,
            ],
            onFinish: (itemsStore) => {
                const booleanExpression = itemsStore[1];
                const block = itemsStore[2];
                return new Node_1.While({ children: [booleanExpression, block] });
            },
            throwErrorOnFirstItem: false,
            errorDetails: { fn: "parseStatement", details: "WHILE" },
        });
        if ((0, utils_1.isTruthy)(node))
            return node;
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.IF) {
            const [booleanExpression, ifBlock] = this.readSequential({
                items: [
                    enums_1.TokenType.IF,
                    this.parseBooleanExpression,
                    this.parseBlock,
                ],
                onFinish: (itemsStore) => {
                    const [_, booleanExpression, ifBlock] = itemsStore;
                    return [booleanExpression, ifBlock];
                },
                errorDetails: { fn: "parseStatement", details: "IF" },
            });
            const node = this.readSequential({
                items: [enums_1.TokenType.ELSE, this.parseBlock, enums_1.TokenType.NEW_LINE],
                onFinish: (itemsStore) => {
                    const elseBlock = itemsStore[1];
                    return new Node_1.If({ children: [booleanExpression, ifBlock, elseBlock] });
                },
                throwErrorOnFirstItem: false,
                errorDetails: { fn: "parseStatement", details: "IF/ELSE" },
            });
            if ((0, utils_1.isTruthy)(node))
                return node;
            return this.readSequential({
                items: [enums_1.TokenType.NEW_LINE],
                onFinish: () => new Node_1.If({ children: [booleanExpression, ifBlock] }),
                errorDetails: { fn: "parseStatement", details: "IF/NEW_LINE" },
            });
        }
        node = this.readSequential({
            items: [enums_1.TokenType.RETURN, this.parseBooleanExpression],
            onFinish: (itemsStore) => {
                const [_, expression] = itemsStore;
                return new Node_1.Return({ children: [expression] });
            },
            throwErrorOnFirstItem: false,
            errorDetails: { fn: "parseStatement", details: "RETURN" },
        });
        if ((0, utils_1.isTruthy)(node))
            return node;
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.OPEN_BRAC) {
            return this.parseBlock();
        }
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.VAR) {
            return this.parseVarDeclaration();
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
    static parseVarDeclaration() {
        const [, identToken, typeToken] = this.readSequential({
            items: [enums_1.TokenType.VAR, enums_1.TokenType.IDENTIFIER, enums_1.TokenType.TYPE],
            throwErrorOnFirstItem: true,
            onFinish: (itemsStore) => itemsStore,
            errorDetails: {
                fn: "parseVarDeclaration",
                details: "VAR/IDENT/TYPE",
            },
        });
        let initializer = null;
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.ASSIGNMENT) {
            this.tokenizer.selectNext();
            initializer = this.parseBooleanExpression();
        }
        if ((0, utils_1.isTruthy)(initializer)) {
            return new Node_1.VarDec({
                // store the declared type in `value`
                value: typeToken.getStringValue(),
                children: [new Node_1.Identifier({ token: identToken }), initializer],
            });
        }
        else {
            return new Node_1.VarDec({
                // store the declared type in `value`
                value: typeToken.getStringValue(),
                children: [new Node_1.Identifier({ token: identToken })],
            });
        }
    }
    static parseFunctionDeclaration() {
        const identifierToken = this.readSequential({
            items: [
                enums_1.TokenType.FUNC,
                enums_1.TokenType.IDENTIFIER,
                enums_1.TokenType.OPEN_PAR,
            ],
            throwErrorOnFirstItem: true,
            onFinish: (itemsStore) => {
                return itemsStore[1];
            },
            errorDetails: {
                fn: "parseFunctionDeclaration",
                details: "FUNC/IDENT/OPEN_PAR",
            },
        });
        const params = [];
        while (this.tokenizer.getNext().getType() !== enums_1.TokenType.CLOSE_PAR) {
            const [paramIdentifier, tokenType] = this.readSequential({
                items: [enums_1.TokenType.IDENTIFIER, enums_1.TokenType.TYPE],
                throwErrorOnFirstItem: true,
                onFinish: (itemsStore) => itemsStore,
                errorDetails: {
                    fn: "parseFunctionDeclaration",
                    details: "IDENT/TYPE",
                },
            });
            const param = new Node_1.VarDec({
                value: tokenType.getStringValue(),
                children: [new Node_1.Identifier({ token: paramIdentifier })],
            });
            params.push(param);
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.COMMA) {
                this.tokenizer.selectNext();
                continue;
            }
            else {
                break;
            }
        }
        if (this.tokenizer.getNext().getType() !== enums_1.TokenType.CLOSE_PAR) {
            this.throwUnexpectedToken({
                fn: "parseFunctionDeclaration",
                details: "NOT_CLOSE_PAR",
            });
        }
        this.tokenizer.selectNext();
        let returnType = null;
        if (this.tokenizer.getNext().getType() === enums_1.TokenType.TYPE) {
            returnType = this.tokenizer
                .getNext()
                .getStringValue();
            this.tokenizer.selectNext();
        }
        return new Node_1.FuncDec({
            value: returnType,
            children: [
                new Node_1.Identifier({ token: identifierToken }),
                ...params,
                this.parseBlock(),
            ],
        });
    }
    static parseProgram() {
        const children = [];
        while (this.tokenizer.getNext().getType() !== enums_1.TokenType.EOF) {
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.NEW_LINE) {
                this.tokenizer.selectNext();
                continue;
            }
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.FUNC) {
                children.push(this.parseFunctionDeclaration());
                continue;
            }
            if (this.tokenizer.getNext().getType() === enums_1.TokenType.VAR) {
                children.push(this.parseVarDeclaration());
                continue;
            }
        }
        return new Node_1.Block({ children });
    }
    static run(sourceCode) {
        this.tokenizer = new Tokenizer_1.Tokenizer({
            source: PrePro_1.PrePro.filter(sourceCode),
            position: 0,
        });
        const program = this.parseProgram();
        if (this.tokenizer.getNext().getType() !== enums_1.TokenType.EOF) {
            throw new Error("Could not detect EOF.");
        }
        const hasMain = program.children.some((node) => node instanceof Node_1.FuncDec &&
            node.children[0].value === "main");
        if (!hasMain) {
            throw new Error(`Function "main" not defined`);
        }
        program.children.push(new Node_1.FuncCall({ children: [], value: "main" }));
        return program;
    }
}
exports.Parser = Parser;
