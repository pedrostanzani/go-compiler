"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolTable = void 0;
class SymbolTable {
    table;
    constructor() {
        this.table = new Map();
    }
    set(key, value) {
        this.table.set(key, value);
    }
    get(key) {
        const value = this.table.get(key);
        if (typeof value === "number") {
            return value;
        }
        throw new Error(`Name error: identifier '${key}' is not defined`);
    }
}
exports.SymbolTable = SymbolTable;
