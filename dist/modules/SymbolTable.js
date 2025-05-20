"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolTable = exports.SymbolType = void 0;
const utils_1 = require("../lib/utils");
var SymbolType;
(function (SymbolType) {
    SymbolType["STRING"] = "STRING";
    SymbolType["INT"] = "INT";
    SymbolType["BOOL"] = "BOOL";
    SymbolType["FUNC"] = "FUNC";
})(SymbolType || (exports.SymbolType = SymbolType = {}));
class SymbolTable {
    table;
    parent;
    constructor(parent = null) {
        this.table = new Map();
        this.parent = parent;
    }
    get(key) {
        const symbol = this.table.get(key);
        if ((0, utils_1.isTruthy)(symbol))
            return symbol;
        if ((0, utils_1.isTruthy)(this.parent))
            return this.parent.get(key);
        throw new Error(`Name error: identifier '${key}' is not defined`);
    }
    setSymbol(key, symbol) {
        if (this.table.has(key)) {
            const current = this.table.get(key);
            if (symbol.type !== current.type) {
                throw new Error(`Cannot set ${symbol.type} to variable declared as ${current.type}`);
            }
            this.table.set(key, symbol);
            return;
        }
        if (this.parent) {
            this.parent.setSymbol(key, symbol);
            return;
        }
        throw new Error(`Variable ${key} does not exist in context`);
    }
    declare(key, type) {
        if (this.table.has(key)) {
            throw new Error(`Variable ${key} has already been declared`);
        }
        this.table.set(key, {
            type: type,
            value: null,
        });
    }
}
exports.SymbolTable = SymbolTable;
