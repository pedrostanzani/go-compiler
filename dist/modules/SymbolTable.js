"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolTable = exports.SymbolType = void 0;
const utils_1 = require("../lib/utils");
var SymbolType;
(function (SymbolType) {
    SymbolType["STRING"] = "STRING";
    SymbolType["INT"] = "INT";
    SymbolType["BOOL"] = "BOOL";
})(SymbolType || (exports.SymbolType = SymbolType = {}));
;
class SymbolTable {
    table;
    constructor() {
        this.table = new Map();
    }
    get(key) {
        const symbol = this.table.get(key);
        if ((0, utils_1.isTruthy)(symbol))
            return symbol;
        throw new Error(`Name error: identifier '${key}' is not defined`);
    }
    setSymbol(key, symbol) {
        const currentSymbol = this.table.get(key);
        if (!(0, utils_1.isTruthy)(currentSymbol)) {
            throw new Error(`Variable ${key} does not exist in context`);
        }
        if (symbol.type !== currentSymbol.type) {
            throw new Error(`Cannot set ${symbol.type} to variable declared as ${currentSymbol.type}`);
        }
        this.table.set(key, symbol);
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
