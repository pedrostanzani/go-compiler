"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scan = exports.If = exports.While = exports.VarDec = exports.Assignment = exports.Print = exports.Block = exports.Identifier = exports.NoOp = exports.BoolVal = exports.StringVal = exports.IntVal = exports.UnOp = exports.BinOp = void 0;
const enums_1 = require("../lib/enums");
const input_1 = require("../lib/input");
const utils_1 = require("../lib/utils");
const SymbolTable_1 = require("./SymbolTable");
const NodeIdService_1 = require("./NodeIdService");
const Code_1 = require("./Code");
class BinOp {
    id;
    value;
    children;
    constructor({ value, children, }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate(symbolTable) {
        const [firstChild, secondChild] = this.children;
        if (this.value === enums_1.TokenType.PLUS ||
            this.value === enums_1.TokenType.MINUS ||
            this.value === enums_1.TokenType.DIVIDE ||
            this.value === enums_1.TokenType.X) {
            secondChild.generate(symbolTable);
            Code_1.code.append(`push eax ;`);
            firstChild.generate(symbolTable);
            Code_1.code.append(`pop ecx ;`);
            switch (this.value) {
                case enums_1.TokenType.PLUS:
                    Code_1.code.append(`add eax, ecx ;`);
                    return;
                case enums_1.TokenType.MINUS:
                    Code_1.code.append(`sub eax, ecx ;`);
                    return;
                case enums_1.TokenType.DIVIDE:
                    Code_1.code.append(`cdq           ;`);
                    Code_1.code.append(`idiv  ecx     ;`);
                    return;
                case enums_1.TokenType.X:
                    Code_1.code.append(`imul  ecx     ;`);
                    return;
            }
        }
        else {
            secondChild.generate(symbolTable);
            Code_1.code.append(`push eax ;`);
            firstChild.generate(symbolTable);
            Code_1.code.append(`pop ecx ;`);
            switch (this.value) {
                case enums_1.TokenType.EQUALS:
                    Code_1.code.append(`cmp eax, ecx ;`);
                    Code_1.code.append(`mov ecx, 1   ;`);
                    Code_1.code.append(`mov eax, 0   ;`);
                    Code_1.code.append(`cmove eax, ecx ;`);
                    return;
                case enums_1.TokenType.GREATER_THAN:
                    Code_1.code.append(`cmp eax, ecx ;`);
                    Code_1.code.append(`mov ecx, 1   ;`);
                    Code_1.code.append(`mov eax, 0   ;`);
                    Code_1.code.append(`cmovg eax, ecx ;`);
                    return;
                case enums_1.TokenType.LESS_THAN:
                    Code_1.code.append(`cmp eax, ecx ;`);
                    Code_1.code.append(`mov ecx, 1   ;`);
                    Code_1.code.append(`mov eax, 0   ;`);
                    Code_1.code.append(`cmovl eax, ecx ;`);
                    return;
                case enums_1.TokenType.OR:
                    Code_1.code.append(`or eax, ecx ;`);
                    return;
                case enums_1.TokenType.AND:
                    Code_1.code.append(`and eax, ecx ;`);
                    return;
            }
        }
    }
}
exports.BinOp = BinOp;
class UnOp {
    id;
    value;
    children;
    constructor({ value, children, }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate(symbolTable) {
        const child = this.children[0];
        if (this.value === enums_1.TokenType.MINUS) {
            child.generate(symbolTable);
            Code_1.code.append(`neg eax;`);
        }
        else if (this.value === enums_1.TokenType.PLUS) {
            child.generate(symbolTable);
        }
        else {
            child.generate(symbolTable);
            Code_1.code.append(`test eax, eax;`);
            Code_1.code.append(`setz al;`);
            Code_1.code.append(`movzx eax, al;`);
        }
    }
}
exports.UnOp = UnOp;
class IntVal {
    id;
    value;
    children;
    constructor({ value, children, }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
        this.value = value;
        this.children = children;
    }
    evaluate() {
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: this.value,
        };
    }
    generate() {
        Code_1.code.append(`mov eax, ${this.value} ;`);
    }
}
exports.IntVal = IntVal;
class StringVal {
    id;
    value;
    children;
    constructor({ value }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
        this.value = value;
        this.children = [];
    }
    evaluate() {
        return {
            type: SymbolTable_1.SymbolType.STRING,
            value: this.value,
        };
    }
    generate() { }
}
exports.StringVal = StringVal;
class BoolVal {
    id;
    value;
    children;
    constructor({ value }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
        this.value = value;
        this.children = [];
    }
    evaluate() {
        return {
            type: SymbolTable_1.SymbolType.BOOL,
            value: this.value,
        };
    }
    generate() {
        Code_1.code.append(`mov eax, ${this.value ? "1" : "0"} ;`);
    }
}
exports.BoolVal = BoolVal;
class NoOp {
    id;
    value;
    children;
    constructor() {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
        this.value = null;
        this.children = [];
    }
    evaluate() {
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: this.value ?? 0,
        };
    }
    generate() { }
}
exports.NoOp = NoOp;
class Identifier {
    id;
    value;
    children;
    constructor({ token }) {
        if (token.getType() !== enums_1.TokenType.IDENTIFIER) {
            throw new Error("Expected identifier token.");
        }
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate() { }
}
exports.Identifier = Identifier;
class Block {
    id;
    value;
    children;
    constructor({ children }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate(symbolTable) {
        this.children.forEach((child) => {
            child.generate(symbolTable);
        });
    }
}
exports.Block = Block;
class Print {
    id;
    value;
    children;
    constructor({ children }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate(symbolTable) {
        const expr = this.children[0];
        expr.generate(symbolTable);
        Code_1.code.append(`push eax ;`);
        Code_1.code.append(`push format_out ;`);
        Code_1.code.append(`call printf ;`);
        Code_1.code.append(`add esp, 8 ;`);
    }
}
exports.Print = Print;
class Assignment {
    id;
    value;
    children;
    constructor({ children }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate(symbolTable) {
        const [firstChild, secondChild] = this.children;
        if (typeof firstChild.value !== "string") {
            throw new Error("Cannot assign to literal");
        }
        secondChild.generate(symbolTable);
        const sym = symbolTable.get(firstChild.value);
        if (sym.offset == null) {
            throw new Error(`No offset recorded for variable '${firstChild.value}'`);
        }
        // 4) emit the store instruction
        Code_1.code.append(`mov [ebp-${sym.offset}], eax ;`);
    }
}
exports.Assignment = Assignment;
class VarDec {
    id;
    value;
    children;
    constructor({ children, value, }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate(symbolTable) {
        const idNode = this.children[0];
        if (typeof idNode.value !== "string") {
            throw new Error("Cannot declare a non-identifier");
        }
        symbolTable.declare(idNode.value, this.value);
        Code_1.code.append(`sub esp, ${SymbolTable_1.BYTE_SHIFT_INCREMENT} ;`);
        if (this.children.length === 2) {
            const initExpr = this.children[1];
            initExpr.generate(symbolTable);
            const sym = symbolTable.get(idNode.value);
            if (sym.offset == null) {
                throw new Error(`No offset for variable '${this.value}'`);
            }
            Code_1.code.append(`mov [ebp-${sym.offset}], eax ;`);
        }
    }
}
exports.VarDec = VarDec;
class While {
    id;
    value;
    children;
    constructor({ children }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate(symbolTable) {
        const [firstChild, secondChild] = this.children;
        const loopLabel = `loop_${this.id}`;
        const exitLabel = `exit_${this.id}`;
        Code_1.code.append(`${loopLabel}:`);
        firstChild.generate(symbolTable);
        Code_1.code.append(`cmp eax, 0 ;`);
        Code_1.code.append(`je  ${exitLabel} ;`);
        secondChild.generate(symbolTable);
        Code_1.code.append(`jmp ${loopLabel} ;`);
        Code_1.code.append(`${exitLabel}:`);
    }
}
exports.While = While;
class If {
    id;
    value;
    children;
    constructor({ children }) {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
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
    generate(symbolTable) {
        const [condition, ifBlock, elseBlock] = this.children;
        const elseLabel = `else_${this.id}`;
        const exitLabel = `exit_${this.id}`;
        condition.generate(symbolTable);
        Code_1.code.append(`cmp eax, 0 ;`);
        if ((0, utils_1.isTruthy)(elseBlock)) {
            Code_1.code.append(`je  ${elseLabel} ;`);
        }
        else {
            Code_1.code.append(`je  ${exitLabel} ;`);
        }
        ifBlock.generate(symbolTable);
        Code_1.code.append(`jmp ${exitLabel} ;`);
        if ((0, utils_1.isTruthy)(elseBlock)) {
            Code_1.code.append(`${elseLabel}:`);
            elseBlock.generate(symbolTable);
        }
        Code_1.code.append(`${exitLabel}:`);
    }
}
exports.If = If;
class Scan {
    static input = new input_1.Input("syncprompt");
    id;
    value;
    children;
    constructor() {
        this.id = NodeIdService_1.nodeIdService.getId();
        NodeIdService_1.nodeIdService.increment();
        this.value = null;
        this.children = [];
    }
    evaluate(_) {
        return {
            type: SymbolTable_1.SymbolType.INT,
            value: Number(Scan.input.get()),
        };
    }
    generate() {
        Code_1.code.append(`push scan_int ;`);
        Code_1.code.append(`push format_in ;`);
        Code_1.code.append(`call scanf ;`);
        Code_1.code.append(`add esp, 8 ;`);
        Code_1.code.append(`mov eax, dword [scan_int] ;`);
    }
}
exports.Scan = Scan;
