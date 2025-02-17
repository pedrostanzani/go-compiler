"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    type;
    value;
    constructor({ type, value }) {
        this.type = type;
        this.value = value;
    }
    getType() {
        return this.type;
    }
    getValue() {
        return this.value;
    }
    getRepr() {
        return JSON.stringify({
            type: this.type,
            value: this.value,
        });
    }
}
exports.Token = Token;
