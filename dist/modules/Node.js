"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scan = exports.If = exports.While = exports.VarDec = exports.Assignment = exports.Print = exports.Block = exports.Identifier = exports.NoOp = exports.BoolVal = exports.StringVal = exports.IntVal = exports.UnOp = exports.BinOp = void 0;
const enums_1 = require("../lib/enums");
const input_1 = require("../lib/input");
const utils_1 = require("../lib/utils");
const SymbolTable_1 = require("./SymbolTable");
class BinOp {
    value;
    children;
    constructor({ value, children, }) {
        this.value = value;
        this.children = children;
    }
    handleStringOp(a, b, options = {
        allowComparison: true,
        errorMessage: `Invalid operation ${this.value} for operands of type string`,
    }) {
        if (this.value === enums_1.TokenType.PLUS) {
            return {
                type: SymbolTable_1.SymbolType.STRING,
                value: a + b,
            };
        }
        if (!options.allowComparison) {
            throw new Error(options.errorMessage);
        }
        if (this.value === enums_1.TokenType.LESS_THAN) {
            return {
                type: SymbolTable_1.SymbolType.BOOL,
                value: a < b,
            };
        }
        if (this.value === enums_1.TokenType.GREATER_THAN) {
            return {
                type: SymbolTable_1.SymbolType.BOOL,
                value: a > b,
            };
        }
        if (this.value === enums_1.TokenType.EQUALS) {
            return {
                type: SymbolTable_1.SymbolType.BOOL,
                value: a === b,
            };
        }
        throw new Error(options.errorMessage);
    }
    evaluate(symbolTable) {
        const [firstValue, secondValue] = this.children.map((child) => child.evaluate(symbolTable).value);
        if (typeof firstValue === "string" && typeof secondValue === "string") {
            return this.handleStringOp(firstValue, secondValue);
        }
        if (typeof firstValue === "boolean" && typeof secondValue === "string") {
            return this.handleStringOp(String(firstValue), secondValue, {
                allowComparison: false,
                errorMessage: `Invalid operation ${this.value} for operands of type boolean and string`,
            });
        }
        if (typeof firstValue === "string" && typeof secondValue === "boolean") {
            return this.handleStringOp(firstValue, String(secondValue), {
                allowComparison: false,
                errorMessage: `Invalid operation ${this.value} for operands of type boolean and string`,
            });
        }
        if (typeof firstValue === "number" && typeof secondValue === "string") {
            return this.handleStringOp(String(firstValue), secondValue, {
                allowComparison: false,
                errorMessage: `Invalid operation ${this.value} for operands of type number and string`,
            });
        }
        if (typeof firstValue === "string" && typeof secondValue === "number") {
            return this.handleStringOp(firstValue, String(secondValue), {
                allowComparison: false,
                errorMessage: `Invalid operation ${this.value} for operands of type number and string`,
            });
        }
        if (typeof firstValue === "number" && typeof secondValue === "number") {
            switch (this.value) {
                case enums_1.TokenType.PLUS:
                    return {
                        type: SymbolTable_1.SymbolType.INT,
                        value: firstValue + secondValue,
                    };
                case enums_1.TokenType.MINUS:
                    return {
                        type: SymbolTable_1.SymbolType.INT,
                        value: firstValue - secondValue,
                    };
                case enums_1.TokenType.DIVIDE:
                    return {
                        type: SymbolTable_1.SymbolType.INT,
                        value: Math.floor(firstValue / secondValue),
                    };
                case enums_1.TokenType.X:
                    return {
                        type: SymbolTable_1.SymbolType.INT,
                        value: firstValue * secondValue,
                    };
                case enums_1.TokenType.OR:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue || secondValue ? true : false,
                    };
                case enums_1.TokenType.AND:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue && secondValue ? true : false,
                    };
                case enums_1.TokenType.EQUALS:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue == secondValue ? true : false,
                    };
                case enums_1.TokenType.GREATER_THAN:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue > secondValue ? true : false,
                    };
                case enums_1.TokenType.LESS_THAN:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue < secondValue ? true : false,
                    };
                default:
                    break;
            }
        }
        if (typeof firstValue === "boolean" && typeof secondValue === "boolean") {
            switch (this.value) {
                case enums_1.TokenType.OR:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue || secondValue ? true : false,
                    };
                case enums_1.TokenType.AND:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue && secondValue ? true : false,
                    };
                case enums_1.TokenType.EQUALS:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue == secondValue ? true : false,
                    };
                case enums_1.TokenType.GREATER_THAN:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue > secondValue ? true : false,
                    };
                case enums_1.TokenType.LESS_THAN:
                    return {
                        type: SymbolTable_1.SymbolType.BOOL,
                        value: firstValue < secondValue ? true : false,
                    };
                default:
                    break;
            }
        }
        if ((typeof firstValue === "number" && typeof secondValue === "boolean") ||
            (typeof firstValue === "boolean" && typeof secondValue === "number")) {
            throw new Error(`Invalid operation ${this.value} for operands of type number and boolean`);
        }
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: 0,
        };
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
            const childEval = child.evaluate(symbolTable);
            return {
                ...childEval,
                value: -childEval.value,
            };
        }
        else if (this.value === enums_1.TokenType.PLUS) {
            return child.evaluate(symbolTable);
        }
        else {
            const symbol = child.evaluate(symbolTable);
            if (symbol.type === SymbolTable_1.SymbolType.INT) {
                throw new Error(`Invalid operation ${this.value} for operand of type number`);
            }
            return !symbol.value
                ? {
                    type: SymbolTable_1.SymbolType.BOOL,
                    value: true,
                }
                : {
                    type: SymbolTable_1.SymbolType.BOOL,
                    value: false,
                };
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
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: this.value,
        };
    }
}
exports.IntVal = IntVal;
class StringVal {
    value;
    children;
    constructor({ value }) {
        this.value = value;
        this.children = [];
    }
    evaluate() {
        return {
            type: SymbolTable_1.SymbolType.STRING,
            value: this.value,
        };
    }
}
exports.StringVal = StringVal;
class BoolVal {
    value;
    children;
    constructor({ value }) {
        this.value = value;
        this.children = [];
    }
    evaluate() {
        return {
            type: SymbolTable_1.SymbolType.BOOL,
            value: this.value,
        };
    }
}
exports.BoolVal = BoolVal;
class NoOp {
    value;
    children;
    constructor() {
        this.value = null;
        this.children = [];
    }
    evaluate() {
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: this.value ?? 0,
        };
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
        const symbol = symbolTable.get(this.value);
        if (symbol.value === null) {
            throw new Error(`Cannot evaluate uninitialized symbol ${this.value}`);
        }
        return {
            type: symbol.type,
            value: symbol.value,
        };
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
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: 0,
        };
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
        // console.log("--->", symbolTable)
        console.log(child.evaluate(symbolTable).value);
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: 0,
        };
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
        const secondChildSymbol = secondChild.evaluate(symbolTable);
        symbolTable.setSymbol(firstChild.value, secondChildSymbol);
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: 0,
        };
    }
}
exports.Assignment = Assignment;
class VarDec {
    value;
    children;
    constructor({ children, value, }) {
        this.value = value;
        this.children = children;
    }
    evaluate(symbolTable) {
        if (this.children.length === 1) {
            const child = this.children[0];
            if (typeof child.value !== "string") {
                throw new Error("Cannot assign to literal");
            }
            symbolTable.declare(child.value, this.value);
        }
        else {
            const [firstChild, secondChild] = this.children;
            if (typeof firstChild.value !== "string") {
                throw new Error("Cannot assign to literal");
            }
            const secondChildSymbol = secondChild.evaluate(symbolTable);
            if (secondChildSymbol.type !== this.value) {
                throw new Error(`Cannot assign ${secondChildSymbol.type} to ${this.value} variable`);
            }
            symbolTable.declare(firstChild.value, secondChildSymbol.type);
            symbolTable.setSymbol(firstChild.value, secondChildSymbol);
        }
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: 0,
        };
    }
}
exports.VarDec = VarDec;
class While {
    value;
    children;
    constructor({ children }) {
        this.value = null;
        this.children = children;
    }
    evaluateAndCheckIfBoolean(node, symbolTable) {
        const conditionSymbol = node.evaluate(symbolTable);
        if (conditionSymbol.type !== SymbolTable_1.SymbolType.BOOL) {
            throw new Error(`Cannot compute condition with type ${conditionSymbol.type}`);
        }
        return conditionSymbol.value;
    }
    evaluate(symbolTable) {
        const [firstChild, secondChild] = this.children;
        while (this.evaluateAndCheckIfBoolean(firstChild, symbolTable)) {
            secondChild.evaluate(symbolTable);
        }
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: 0,
        };
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
        const conditionSymbol = condition.evaluate(symbolTable);
        if (conditionSymbol.type !== SymbolTable_1.SymbolType.BOOL) {
            throw new Error(`Cannot compute condition with type ${conditionSymbol.type}`);
        }
        if (conditionSymbol.value) {
            ifBlock.evaluate(symbolTable);
        }
        else if ((0, utils_1.isTruthy)(elseBlock)) {
            elseBlock.evaluate(symbolTable);
        }
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: 0,
        };
    }
}
exports.If = If;
class Scan {
    static input = new input_1.Input("syncprompt");
    value;
    children;
    constructor() {
        this.value = null;
        this.children = [];
    }
    evaluate(_) {
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: Number(Scan.input.get()),
        };
    }
}
exports.Scan = Scan;
