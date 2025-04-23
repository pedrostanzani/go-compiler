"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scan = exports.If = exports.While = exports.Assignment = exports.Print = exports.Block = exports.Identifier = exports.NoOp = exports.IntVal = exports.UnOp = exports.BinOp = void 0;
const enums_1 = require("../lib/enums");
const input_1 = require("../lib/input");
const utils_1 = require("../lib/utils");
class BinOp {
    value;
    children;
    constructor({ value, children, }) {
        this.value = value;
        this.children = children;
    }
    evaluate(symbolTable) {
        const [firstChild, secondChild] = this.children;
        switch (this.value) {
            case enums_1.TokenType.PLUS:
                return (firstChild.evaluate(symbolTable) + secondChild.evaluate(symbolTable));
            case enums_1.TokenType.MINUS:
                return (firstChild.evaluate(symbolTable) - secondChild.evaluate(symbolTable));
            case enums_1.TokenType.DIVIDE:
                return Math.floor(firstChild.evaluate(symbolTable) / secondChild.evaluate(symbolTable));
            case enums_1.TokenType.X:
                return (firstChild.evaluate(symbolTable) * secondChild.evaluate(symbolTable));
            case enums_1.TokenType.OR:
                return firstChild.evaluate(symbolTable) ||
                    secondChild.evaluate(symbolTable)
                    ? 1
                    : 0;
            case enums_1.TokenType.AND:
                return firstChild.evaluate(symbolTable) &&
                    secondChild.evaluate(symbolTable)
                    ? 1
                    : 0;
            case enums_1.TokenType.EQUALS:
                return firstChild.evaluate(symbolTable) ==
                    secondChild.evaluate(symbolTable)
                    ? 1
                    : 0;
            case enums_1.TokenType.GREATER_THAN:
                return firstChild.evaluate(symbolTable) >
                    secondChild.evaluate(symbolTable)
                    ? 1
                    : 0;
            case enums_1.TokenType.LESS_THAN:
                return firstChild.evaluate(symbolTable) <
                    secondChild.evaluate(symbolTable)
                    ? 1
                    : 0;
            default:
                break;
        }
        return 0;
    }
}
exports.BinOp = BinOp;
class UnOp {
    value;
    children;
    constructor({ value, children, }) {
        this.value = value;
        this.children = children;
    }
    evaluate(symbolTable) {
        const child = this.children[0];
        if (this.value === enums_1.TokenType.MINUS) {
            return -child.evaluate(symbolTable);
        }
        else if (this.value === enums_1.TokenType.PLUS) {
            return child.evaluate(symbolTable);
        }
        else {
            return !child.evaluate(symbolTable) ? 1 : 0;
        }
    }
}
exports.UnOp = UnOp;
class IntVal {
    value;
    children;
    constructor({ value, children, }) {
        this.value = value;
        this.children = children;
    }
    evaluate() {
        return this.value;
    }
}
exports.IntVal = IntVal;
class NoOp {
    value;
    children;
    constructor() {
        this.value = null;
        this.children = [];
    }
    evaluate() {
        return this.value ?? 0;
    }
}
exports.NoOp = NoOp;
class Identifier {
    value;
    children;
    constructor({ token }) {
        if (token.getType() !== enums_1.TokenType.IDENTIFIER) {
            throw new Error("Expected identifier token.");
        }
        this.value = token.getStringValue();
        this.children = [];
    }
    evaluate(symbolTable) {
        return symbolTable.get(this.value);
    }
}
exports.Identifier = Identifier;
class Block {
    value;
    children;
    constructor({ children }) {
        this.value = null;
        this.children = children;
    }
    evaluate(symbolTable) {
        this.children.forEach((child) => {
            child.evaluate(symbolTable);
        });
        return 0;
    }
}
exports.Block = Block;
class Print {
    value;
    children;
    constructor({ children }) {
        this.value = null;
        this.children = children;
    }
    evaluate(symbolTable) {
        const child = this.children[0];
        console.log(child.evaluate(symbolTable));
        return 0;
    }
}
exports.Print = Print;
class Assignment {
    value;
    children;
    constructor({ children }) {
        this.value = null;
        this.children = children;
    }
    evaluate(symbolTable) {
        const [firstChild, secondChild] = this.children;
        if (typeof firstChild.value !== "string") {
            throw new Error("Cannot assign to literal");
        }
        symbolTable.set(firstChild.value, secondChild.evaluate(symbolTable));
        return 0;
    }
}
exports.Assignment = Assignment;
class While {
    value;
    children;
    constructor({ children }) {
        this.value = null;
        this.children = children;
    }
    evaluate(symbolTable) {
        const [firstChild, secondChild] = this.children;
        while (firstChild.evaluate(symbolTable)) {
            secondChild.evaluate(symbolTable);
        }
        return 0;
    }
}
exports.While = While;
class If {
    value;
    children;
    constructor({ children }) {
        this.value = null;
        this.children = children;
    }
    evaluate(symbolTable) {
        const [condition, ifBlock, elseBlock] = this.children;
        if (condition.evaluate(symbolTable)) {
            ifBlock.evaluate(symbolTable);
        }
        else if ((0, utils_1.isTruthy)(elseBlock)) {
            elseBlock.evaluate(symbolTable);
        }
        return 0;
    }
}
exports.If = If;
class Scan {
    value;
    children;
    constructor() {
        this.value = null;
        this.children = [];
    }
    evaluate(symbolTable) {
        return Number((0, input_1.input)());
    }
}
exports.Scan = Scan;
